import React, { useEffect, useState } from 'react'
import { Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Pedido } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const AdminOrders: React.FC = () => {
  const { supabaseAuthenticatedClient } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    if (!supabaseAuthenticatedClient) return
    
    try {
      const { data, error } = await supabaseAuthenticatedClient
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return
      }

      setPedidos(data || [])
    } catch (error) {
      console.error('Error in fetchPedidos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (pedidoId: string, newStatus: string) => {
    if (!supabaseAuthenticatedClient) return
    
    try {
      const { error } = await supabaseAuthenticatedClient
        .from('pedidos')
        .update({ estado: newStatus })
        .eq('id', pedidoId)

      if (error) {
        console.error('Error updating order status:', error)
        return
      }

      fetchPedidos()
      setSelectedPedido(null)
    } catch (error) {
      console.error('Error in updateOrderStatus:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'procesando':
        return 'bg-blue-100 text-blue-800'
      case 'enviado':
        return 'bg-purple-100 text-purple-800'
      case 'entregado':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Package className="w-4 h-4" />
      case 'procesando':
        return <Package className="w-4 h-4" />
      case 'enviado':
        return <Truck className="w-4 h-4" />
      case 'entregado':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelado':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const filteredPedidos = pedidos.filter(pedido =>
    filterStatus === '' || pedido.estado === filterStatus
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gris-oscuro">Gestión de Pedidos</h2>
          <p className="text-gray-600">Administra todos los pedidos de la tienda</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="procesando">Procesando</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gris-oscuro">
                      #{pedido.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pedido.items.length} producto(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gris-oscuro">
                      {pedido.usuario_id.slice(-8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pedido.estado)}`}>
                      {getStatusIcon(pedido.estado)}
                      <span className="ml-1 capitalize">{pedido.estado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dorado">
                    {formatPrice(pedido.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(pedido.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedPedido(pedido)}
                      className="text-amarillo hover:text-dorado transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gris-oscuro">
                Pedido #{selectedPedido.id.slice(-8)}
              </h3>
              <button
                onClick={() => setSelectedPedido(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Items */}
              <div>
                <h4 className="text-lg font-semibold text-gris-oscuro mb-4">
                  Productos
                </h4>
                <div className="space-y-4">
                  {selectedPedido.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gris-oscuro">{item.nombre}</h5>
                        <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                        <p className="text-sm font-medium text-dorado">
                          {formatPrice(item.precio * item.cantidad)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h4 className="text-lg font-semibold text-gris-oscuro mb-4">
                  Detalles del Pedido
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Estado actual:</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPedido.estado)}`}>
                      {getStatusIcon(selectedPedido.estado)}
                      <span className="ml-1 capitalize">{selectedPedido.estado}</span>
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fecha:</label>
                    <p className="text-gris-oscuro">{formatDate(selectedPedido.created_at)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Dirección de envío:</label>
                    <p className="text-gris-oscuro">{selectedPedido.direccion_envio}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Método de pago:</label>
                    <p className="text-gris-oscuro capitalize">{selectedPedido.metodo_pago}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatPrice(selectedPedido.subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">IGV (18%):</span>
                      <span className="font-medium">{formatPrice(selectedPedido.igv)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gris-oscuro">Total:</span>
                      <span className="text-dorado">{formatPrice(selectedPedido.total)}</span>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Actualizar estado:
                    </label>
                    <div className="flex space-x-2">
                      {['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedPedido.id, status)}
                          disabled={selectedPedido.estado === status}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                            selectedPedido.estado === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-amarillo text-gris-oscuro hover:bg-dorado'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders


