import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Clock, Eye, ShoppingCart, Trash2, Star } from 'lucide-react'
import { 
  clearNavigationHistory, 
  type NavigationHistoryItem 
} from '@/lib/userProfile'
import { useCart } from '@/contexts/CartContext'
import { usePagination } from '@/hooks/usePagination'
import { useUserHistory, useUserMutations } from '@/hooks/useUserQueries'
import Pagination from '@/components/common/Pagination'

import { Link } from 'react-router-dom'

const HistoryPage: React.FC = () => {
  const { user } = useUser()
  const { addToCart } = useCart()
  const [clearing, setClearing] = useState(false)
  
  // Usar React Query para obtener el historial con cache
  const { data: historyItems = [], isLoading: loading, error } = useUserHistory(user?.id || '', 50)
  const { invalidateUserHistory } = useUserMutations()
  
  // Paginación
  const ITEMS_PER_PAGE = 12
  const pagination = usePagination({
    data: historyItems,
    itemsPerPage: ITEMS_PER_PAGE
  })

  const handleClearHistory = async () => {
    if (!user?.id) return
    
    if (!confirm('¿Estás seguro de que quieres limpiar todo tu historial de navegación?')) return

    setClearing(true)
    const result = await clearNavigationHistory(user.id)
    
    if (result.error) {
      console.error(result.error)
    } else {
      // Invalidar cache para actualizar la UI
      invalidateUserHistory(user.id)
    }
    
    setClearing(false)
  }

  const handleAddToCart = (item: NavigationHistoryItem) => {
    if (!item.producto) return

    addToCart({
      id: item.producto.id,
      nombre: item.producto.nombre,
      descripcion: '',
      precio: item.producto.precio,
      imagen: item.producto.imagen,
      stock: 0, // Se validará en el carrito
      categoria: '',
      created_at: '',
      updated_at: ''
    }, 1)
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

    if (diffInDays > 0) {
      return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    } else if (diffInHours > 0) {
      return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else if (diffInMinutes > 0) {
      return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
    } else {
      return 'hace unos momentos'
    }
  }

  const groupItemsByDate = (items: NavigationHistoryItem[]) => {
    const groups: { [key: string]: NavigationHistoryItem[] } = {}
    
    items.forEach(item => {
      const date = new Date(item.updated_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let groupKey: string
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoy'
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ayer'
      } else {
        groupKey = date.toLocaleDateString('es-PE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })
    
    return groups
  }

  // Obtener elementos paginados
  const paginatedItems = pagination.currentItems
  const groupedItems = groupItemsByDate(paginatedItems)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200">{error?.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Historial de Navegación
              </h1>
            </div>
            
            {historyItems.length > 0 && (
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                {clearing ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Limpiar Historial</span>
              </button>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Productos que has visitado recientemente
          </p>
          
          {/* Información de paginación */}
          {historyItems.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Mostrando {pagination.startIndex + 1}-{Math.min(pagination.endIndex, historyItems.length)} de {historyItems.length} productos
              </span>
              <span>
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Productos Visitados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {historyItems.length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Productos Únicos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(historyItems.map(item => item.producto_id)).size}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última Visita</p>
                <p className="text-lg font-bold text-green-600">
                  {historyItems.length > 0 ? getTimeAgo(historyItems[0].updated_at) : 'Nunca'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Historial agrupado por fecha */}
        {historyItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Tu historial está vacío
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explora nuestros productos para comenzar a construir tu historial
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([dateGroup, items]) => (
              <div key={dateGroup} className="space-y-4">
                {/* Título del grupo de fecha */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {dateGroup}
                </h2>

                {/* Productos del grupo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.updated_at}`}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      {item.producto && (
                        <>
                          {/* Imagen del producto */}
                          <div className="relative">
                            <img
                              src={item.producto.imagen}
                              alt={item.producto.nombre}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {getTimeAgo(item.updated_at)}
                            </div>
                          </div>

                          {/* Información del producto */}
                          <div className="p-4">
                            <Link
                              to={`/producto/${item.producto.id}`}
                              className="block mb-2"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                                {item.producto.nombre}
                              </h3>
                            </Link>

                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                S/ {item.producto.precio.toFixed(2)}
                              </span>
                              
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 text-yellow-400 fill-current"
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex space-x-2">
                              <Link
                                to={`/producto/${item.producto.id}`}
                                className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </Link>
                              
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Agregar
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {historyItems.length > ITEMS_PER_PAGE && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setCurrentPage}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
