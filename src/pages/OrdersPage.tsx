import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { getUserOrders, type Order } from '@/lib/orders'
import { Link } from 'react-router-dom'

const OrdersPage: React.FC = () => {
  const { user } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadOrders()
    }
  }, [user?.id])

  const loadOrders = async () => {
    if (!user?.id) return

    setLoading(true)
    const result = await getUserOrders(user.id)
    
    if (result.error) {
      setError(result.error)
    } else {
      setOrders(result.data || [])
    }
    
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'pagado':
      case 'procesando':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'enviado':
        return <Truck className="w-5 h-5 text-purple-500" />
      case 'entregado':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelado':
      case 'fallido':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'pagado':
      case 'procesando':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'enviado':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'entregado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'cancelado':
      case 'fallido':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'pagado': 'Pagado',
      'procesando': 'Procesando',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado',
      'fallido': 'Fallido'
    }
    return statusMap[status] || status
  }

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
            <p className="text-red-800 dark:text-red-200">{error}</p>
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
          <div className="flex items-center space-x-3 mb-4">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Mis Pedidos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Historial completo de tus compras y estado de envíos
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {orders.length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entregados</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(order => order.estado === 'entregado').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Proceso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(order => ['pagado', 'procesando', 'enviado'].includes(order.estado)).length}
                </p>
              </div>
              <Truck className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  S/ {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </p>
              </div>
              <Package className="w-8 h-8 text-gray-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No tienes pedidos aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explora nuestros productos y realiza tu primera compra
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                {/* Header del pedido */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.estado)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Pedido #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.estado)}`}>
                        {formatStatus(order.estado)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                        S/ {order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Método de pago</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {order.metodo_pago}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Dirección de envío</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {order.direccion_envio}
                      </p>
                    </div>
                    {order.fecha_pago && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Fecha de pago</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(order.fecha_pago).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items del pedido */}
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Productos ({Array.isArray(order.items) ? order.items.length : 0})
                  </h4>
                  <div className="space-y-3">
                    {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <img
                          src={item.image || item.imagen || '/placeholder-product.jpg'}
                          alt={item.title || item.nombre}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.title || item.nombre}
                          </p>
                          
                          {/* Mostrar variante si existe */}
                          {(item.variant_label || item.variant_name) && (
                            <div className="mt-1 mb-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Variante:</p>
                              <div className="flex flex-wrap gap-1">
                                {(item.variant_label || item.variant_name)?.split('/').map((option: string, idx: number) => {
                                  const [optName, optValue] = option.split(':').map((s: string) => s.trim())
                                  return (
                                    <span 
                                      key={idx}
                                      className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                                    >
                                      <span className="text-gray-600 dark:text-gray-400">{optName}:</span>
                                      <span className="ml-1">{optValue}</span>
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cantidad: {item.quantity || item.cantidad} × S/ {(item.price || item.precio)?.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                          S/ {((item.quantity || item.cantidad) * (item.price || item.precio)).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage