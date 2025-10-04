import React, { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, MessageSquare, Users, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useUser } from '@clerk/clerk-react'

interface ChatStats {
  totalConversations: number
  uniqueUsers: number
  avgConversationsPerUser: number
  totalProductSearches: number
}

interface TopQuestion {
  question: string
  count: number
  category: string
}

interface DailyStats {
  date: string
  count: number
}

const ChatAnalytics: React.FC = () => {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ChatStats>({
    totalConversations: 0,
    uniqueUsers: 0,
    avgConversationsPerUser: 0,
    totalProductSearches: 0
  })
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Verificar si el usuario es admin
  const isAdmin = user?.publicMetadata?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) return
    
    fetchAnalytics()
  }, [timeRange, isAdmin])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Calcular fecha de inicio según el rango
      const now = new Date()
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

      // Obtener estadísticas generales
      const { data: conversations, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (convError) {
        console.error('Error fetching conversations:', convError)
        return
      }

      const totalConvs = conversations?.length || 0
      const uniqueUsers = new Set(conversations?.map(c => c.usuario_id).filter(Boolean)).size
      const productSearches = conversations?.filter(c => c.metadata?.productsFound > 0).length || 0

      setStats({
        totalConversations: totalConvs,
        uniqueUsers: uniqueUsers,
        avgConversationsPerUser: uniqueUsers > 0 ? parseFloat((totalConvs / uniqueUsers).toFixed(2)) : 0,
        totalProductSearches: productSearches
      })

      // Agrupar preguntas similares (simplificado por ahora)
      const questionCounts = new Map<string, number>()
      conversations?.forEach(conv => {
        const question = conv.mensaje.toLowerCase().trim()
        const firstWords = question.split(' ').slice(0, 5).join(' ') // Agrupar por primeras 5 palabras
        questionCounts.set(firstWords, (questionCounts.get(firstWords) || 0) + 1)
      })

      // Categorizar preguntas
      const categorized: TopQuestion[] = Array.from(questionCounts.entries())
        .map(([question, count]) => ({
          question,
          count,
          category: categorizeQuestion(question)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      setTopQuestions(categorized)

      // Estadísticas diarias
      const dailyMap = new Map<string, number>()
      conversations?.forEach(conv => {
        const date = new Date(conv.timestamp).toISOString().split('T')[0]
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
      })

      const dailyData = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setDailyStats(dailyData)

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const categorizeQuestion = (question: string): string => {
    if (question.includes('precio') || question.includes('costo') || question.includes('pago')) {
      return 'Pagos'
    } else if (question.includes('envío') || question.includes('envio') || question.includes('entreg')) {
      return 'Envíos'
    } else if (question.includes('producto') || question.includes('busca') || question.includes('muestra')) {
      return 'Productos'
    } else if (question.includes('cuenta') || question.includes('perfil') || question.includes('usuario')) {
      return 'Cuenta'
    } else if (question.includes('pedido') || question.includes('orden')) {
      return 'Pedidos'
    } else {
      return 'General'
    }
  }

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Pagos': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Envíos': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Productos': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Cuenta': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Pedidos': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'General': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
    return colors[category] || colors['General']
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Acceso denegado</strong>
          <span className="block sm:inline"> No tienes permisos para ver esta página.</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando analíticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amarillo" />
            Analíticas del Chatbot
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Estadísticas y análisis de conversaciones del asistente virtual
          </p>
        </div>

        {/* Selector de rango */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '7d'
                ? 'bg-amarillo text-gray-900'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '30d'
                ? 'bg-amarillo text-gray-900'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            30 días
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '90d'
                ? 'bg-amarillo text-gray-900'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            90 días
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversaciones</h3>
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Mensajes procesados</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios Únicos</h3>
            <Users className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.uniqueUsers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Usuarios que han chateado</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio por Usuario</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgConversationsPerUser}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Mensajes por usuario</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Búsquedas de Productos</h3>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProductSearches}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Productos mostrados en chat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preguntas más frecuentes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amarillo" />
            Top 10 Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            {topQuestions.map((item, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {item.question}
                    </p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <span className="ml-4 flex-shrink-0 text-lg font-bold text-amarillo">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-amarillo h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.count / (topQuestions[0]?.count || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de tendencia diaria */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amarillo" />
            Conversaciones por Día
          </h2>
          <div className="space-y-3">
            {dailyStats.length > 0 ? (
              <div className="relative h-64">
                {/* Simple bar chart */}
                <div className="flex items-end justify-between h-full gap-2">
                  {dailyStats.map((day, index) => {
                    const maxCount = Math.max(...dailyStats.map(d => d.count))
                    const height = (day.count / maxCount) * 100
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-amarillo rounded-t-md hover:bg-yellow-500 transition-colors cursor-pointer relative group"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.count} mensajes
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-nowrap">
                          {new Date(day.date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No hay datos suficientes para mostrar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatAnalytics
