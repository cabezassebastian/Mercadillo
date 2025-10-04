import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, Package, Edit3 } from 'lucide-react'
import { supabase, Pedido } from '@/lib/supabase'

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    telefono: user?.telefono || '',
    direccion: user?.direccion || ''
  })

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('usuario_id', user.id)
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

    fetchPedidos()
  }, [user])

  const handleSave = async () => {
    try {
      await updateUser(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating user:', error)
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
      month: 'long',
      day: 'numeric'
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amarillo"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hueso py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro mb-8">
          Mi Perfil
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informacion del usuario */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gris-oscuro flex items-center">
                  <User className="w-6 h-6 mr-2 text-amarillo" />
                  Informacion Personal
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-amarillo hover:bg-amarillo hover:text-gris-oscuro rounded-lg transition-colors duration-200"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre Completo
                  </label>
                  <p className="text-gris-oscuro font-medium">
                    {user?.nombre} {user?.apellido}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <p className="text-gris-oscuro">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Telefono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gris-oscuro">{user?.telefono || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Direccion
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.direccion}
                      onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                      rows={3}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gris-oscuro">{user?.direccion || 'No especificada'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={handleSave}
                      className="btn-primary flex-1"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          telefono: user?.telefono || '',
                          direccion: user?.direccion || ''
                        })
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historial de pedidos */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gris-oscuro mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2 text-amarillo" />
                Historial de Pedidos
              </h2>

              {pedidos.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No tienes pedidos aun</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidos.map((pedido) => (
                    <div key={pedido.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gris-oscuro">
                            Pedido #{pedido.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(pedido.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-dorado">
                            {formatPrice(pedido.total)}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.estado)}`}>
                            {pedido.estado}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {pedido.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <div className="w-8 h-8 overflow-hidden rounded bg-gray-100">
                              <img
                                src={item.imagen}
                                alt={item.nombre}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="flex-1">{item.nombre}</span>
                            <span className="text-gray-600">x{item.cantidad}</span>
                            <span className="font-medium">{formatPrice(item.precio * item.cantidad)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatPrice(pedido.subtotal)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{formatPrice(pedido.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


