
import React, { useEffect, useState } from 'react'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react'
import SalesChart from './SalesChart'
import TopProducts from './TopProducts'
import LowStockAlert from './LowStockAlert'
import ConversionRate from './ConversionRate'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface DashboardStats {
  totalProductos: number
  totalPedidos: number
  totalUsuarios: number
  ingresosTotales: number
  pedidosHoy: number
  pedidosMes: number
}

type Pedido = {
  id: string;
  total: number;
  created_at: string;
  estado?: string; // Hacemos 'estado' opcional
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProductos: 0,
    totalPedidos: 0,
    totalUsuarios: 0,
    ingresosTotales: 0,
    pedidosHoy: 0,
    pedidosMes: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener estadísticas básicas
        const [productosResult, pedidosResult, usuariosResult] = await Promise.all([
          supabaseAdmin.from('productos').select('id', { count: 'exact' }),
          supabaseAdmin.from('pedidos').select('id, total, created_at, estado', { count: 'exact' }),
          supabaseAdmin.from('usuarios').select('id', { count: 'exact' })
        ])

        const typedPedidosData = (pedidosResult.data || []) as Pedido[]

        const totalProductos = productosResult.count || 0
        const totalPedidos = pedidosResult.count || 0
        const totalUsuarios = usuariosResult.count || 0

        // Calcular ingresos totales
        const ingresosTotales = typedPedidosData.reduce((sum, pedido) => 
          (pedido.estado && pedido.estado !== 'cancelado') ? sum + pedido.total : sum, 0
        ) || 0

        // Calcular pedidos de hoy
        const hoy = new Date().toISOString().split('T')[0]
        const pedidosHoy = typedPedidosData.filter(pedido => 
          pedido.created_at.startsWith(hoy)
        ).length || 0

        // Calcular pedidos del mes
        const inicioMes = new Date()
        inicioMes.setDate(1)
        const pedidosMes = typedPedidosData.filter(pedido => 
          new Date(pedido.created_at) >= inicioMes
        ).length || 0

        setStats({
          totalProductos,
          totalPedidos,
          totalUsuarios,
          ingresosTotales,
          pedidosHoy,
          pedidosMes
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo"></div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gris-oscuro">{stats.totalProductos}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
              <p className="text-2xl font-bold text-gris-oscuro">{stats.totalPedidos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gris-oscuro">{stats.totalUsuarios}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-dorado">{formatPrice(stats.ingresosTotales)}</p>
            </div>
            <div className="w-12 h-12 bg-amarillo rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gris-oscuro" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gris-oscuro mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gris-oscuro">Pedidos hoy</p>
                <p className="text-xs text-gray-600">{stats.pedidosHoy} nuevos pedidos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gris-oscuro">Productos activos</p>
                <p className="text-xs text-gray-600">{stats.totalProductos} productos en catálogo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gris-oscuro">Usuarios registrados</p>
                <p className="text-xs text-gray-600">{stats.totalUsuarios} usuarios activos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gris-oscuro mb-4">
            Resumen del Mes
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pedidos este mes:</span>
              <span className="font-semibold text-gris-oscuro">{stats.pedidosMes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ingresos totales:</span>
              <span className="font-semibold text-dorado">{formatPrice(stats.ingresosTotales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promedio por pedido:</span>
              <span className="font-semibold text-gris-oscuro">
                {stats.totalPedidos > 0 ? formatPrice(stats.ingresosTotales / stats.totalPedidos) : 'S/ 0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="space-y-6">
        {/* Sales Chart - Full Width */}
        <SalesChart />
        
        {/* Top Products - Full Width */}
        <TopProducts />
        
        {/* Grid: Low Stock Alert + Conversion Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LowStockAlert />
          <ConversionRate />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


