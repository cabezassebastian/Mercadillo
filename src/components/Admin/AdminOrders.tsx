import React, { useEffect, useState, useRef } from 'react'
import { Eye, Package, Truck, CheckCircle, XCircle, Send, PackageCheck, ChevronDown, X } from 'lucide-react'
import { Pedido } from '@/lib/supabase'
import { enviarEmailEnvio, enviarEmailEntrega } from '@/lib/emails'
import { fetchAdmin } from '../../lib/adminApi'

const AdminOrders: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [isClosing, setIsClosing] = useState({ filter: false, modal: false })
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  // Helper para cerrar con animación
  const closeWithAnimation = (type: 'filter' | 'modal') => {
    setIsClosing(prev => ({ ...prev, [type]: true }))
    const duration = type === 'filter' ? 150 : 200
    setTimeout(() => {
      if (type === 'filter') setShowFilterDropdown(false)
      else if (type === 'modal') setSelectedPedido(null)
      setIsClosing(prev => ({ ...prev, [type]: false }))
    }, duration)
  }

  // Click fuera para cerrar dropdown de filtros
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        if (showFilterDropdown) closeWithAnimation('filter')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showFilterDropdown])

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const json = await fetchAdmin('orders')
      setPedidos(json.data || [])
    } catch (error) {
      console.error('Error in fetchPedidos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarcarComoEnviado = async (pedido: Pedido) => {
    try {
      // Actualizar estado del pedido
      await fetchAdmin('orders', {
        method: 'PATCH',
        body: JSON.stringify({ id: pedido.id, updates: { estado: 'enviado', fecha_envio: new Date().toISOString() } })
      })

      // Obtener información del usuario
      let userData = null
      try {
        const uj = await fetchAdmin(`users&id=${pedido.usuario_id}`)
        userData = uj.data
      } catch (e) {
        console.warn('Could not fetch user data from admin/users endpoint:', e)
      }

      if (!userData) {
        console.error('Missing user data for email')
        alert('Pedido actualizado pero no se pudo enviar el email')
        fetchPedidos()
        setSelectedPedido(null)
        return
      }

      // Enviar email de notificación (solo en producción)
      try {
        await enviarEmailEnvio({
          email: userData.email,
          nombre: `${userData.nombre} ${userData.apellido}`,
          numero_pedido: pedido.id,
          fecha_envio: new Date().toISOString(),
          numero_seguimiento: undefined, // Puedes agregar un campo para esto
          items: pedido.items.map((item: any) => ({
            nombre: item.nombre || item.title,
            cantidad: item.cantidad || item.quantity
          }))
        })
        alert('Pedido marcado como enviado y email enviado al cliente')
      } catch (emailError) {
        console.error('❌ Error enviando email (normal en desarrollo):', emailError)
        alert('Pedido marcado como enviado (email no enviado - requiere Vercel)')
      }

  fetchPedidos()
  setSelectedPedido(null)
    } catch (error) {
      console.error('Error in handleMarcarComoEnviado:', error)
      alert('Error al procesar la acción')
    }
  }

  const handleMarcarComoEntregado = async (pedido: Pedido) => {
    try {
      // Actualizar estado del pedido
      await fetchAdmin('orders', {
        method: 'PATCH',
        body: JSON.stringify({ id: pedido.id, updates: { estado: 'entregado', fecha_entrega: new Date().toISOString() } })
      })

      // Obtener información del usuario
      let userData = null
      try {
        const uj = await fetchAdmin(`users&id=${pedido.usuario_id}`)
        userData = uj.data
      } catch (e) {
        console.warn('Could not fetch user data from admin/users endpoint:', e)
      }

      if (!userData) {
        console.error('Missing user data for email')
        alert('Pedido actualizado pero no se pudo enviar el email')
        fetchPedidos()
        setSelectedPedido(null)
        return
      }

      // Enviar email de confirmación de entrega (solo en producción)
      try {
        await enviarEmailEntrega({
          email: userData.email,
          nombre: `${userData.nombre} ${userData.apellido}`,
          numero_pedido: pedido.id,
          fecha_entrega: new Date().toISOString(),
          items: pedido.items.map((item: any) => ({
            nombre: item.nombre || item.title,
            cantidad: item.cantidad || item.quantity,
            producto_id: item.producto_id || item.id
          }))
        })
        alert('Pedido marcado como entregado y email enviado al cliente')
      } catch (emailError) {
        console.error('❌ Error enviando email (normal en desarrollo):', emailError)
        alert('Pedido marcado como entregado (email no enviado - requiere Vercel)')
      }

      fetchPedidos()
      setSelectedPedido(null)
    } catch (error) {
      console.error('Error in handleMarcarComoEntregado:', error)
      alert('Error al procesar la acción')
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
      <div className="relative" ref={filterDropdownRef}>
        <button
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {filterStatus === '' ? 'Todos los estados' : 
             filterStatus === 'pendiente' ? 'Pendiente' :
             filterStatus === 'procesando' ? 'Procesando' :
             filterStatus === 'enviado' ? 'Enviado' :
             filterStatus === 'entregado' ? 'Entregado' :
             'Cancelado'}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Filter Dropdown with backdrop for mobile */}
        {showFilterDropdown && (
          <>
            {/* Backdrop móvil */}
            <div 
              className={`sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm ${
                isClosing.filter ? 'animate-backdrop-closing' : 'animate-backdrop'
              }`}
              onClick={() => closeWithAnimation('filter')}
            />
            
            {/* Dropdown */}
            <div className={`absolute sm:relative top-full left-0 mt-2 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden ${
              isClosing.filter ? 'animate-slide-down-closing' : 'animate-slide-up'
            }`}>
              {[
                { value: '', label: 'Todos los estados' },
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'procesando', label: 'Procesando' },
                { value: 'enviado', label: 'Enviado' },
                { value: 'entregado', label: 'Entregado' },
                { value: 'cancelado', label: 'Cancelado' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilterStatus(option.value)
                    closeWithAnimation('filter')
                  }}
                  className={`w-full px-4 py-3 text-left transition-all duration-150 ${
                    filterStatus === option.value
                      ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                  {filterStatus === option.value && (
                    <span className="ml-2">✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${
              isClosing.modal ? 'animate-backdrop-closing' : 'animate-backdrop'
            }`}
            onClick={() => closeWithAnimation('modal')}
          />
          <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
            isClosing.modal ? 'animate-scale-down-closing' : 'animate-scale-up'
          }`}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-gris-oscuro dark:text-gray-100">
                Pedido #{selectedPedido.id.slice(-8)}
              </h3>
              <button
                onClick={() => closeWithAnimation('modal')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                  {/* Información de Entrega */}
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    <h4 className="text-sm font-semibold text-gris-oscuro dark:text-gray-100 flex items-center space-x-2">
                      <span>📋 Información de Entrega</span>
                    </h4>
                    
                    {/* Badge del método de entrega */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Método de entrega:
                      </label>
                      {selectedPedido.metodo_entrega === 'envio' ? (
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
                          <span className="text-2xl">📦</span>
                          <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Envío a domicilio</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Shalom</p>
                          </div>
                        </div>
                      ) : selectedPedido.metodo_entrega === 'contraentrega' ? (
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
                          <span className="text-2xl">🚇</span>
                          <div>
                            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Pago contra entrega</p>
                            <p className="text-xs text-purple-700 dark:text-purple-300">Tren Línea 1</p>
                          </div>
                        </div>
                      ) : selectedPedido.metodo_entrega === 'tienda' ? (
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-lg">
                          <span className="text-2xl">🏪</span>
                          <div>
                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">Recojo en tienda</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Retiro en local</p>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                          <span className="text-2xl">❓</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">No especificado</p>
                            <p className="text-xs text-gray-700 dark:text-gray-400">Sin método definido</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Grid de información del cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPedido.nombre_completo && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            👤 Nombre completo
                          </label>
                          <p className="text-sm font-medium text-gris-oscuro dark:text-gray-100">
                            {selectedPedido.nombre_completo}
                          </p>
                        </div>
                      )}

                      {selectedPedido.dni_cliente && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            🆔 DNI
                          </label>
                          <p className="text-sm font-medium text-gris-oscuro dark:text-gray-100 font-mono">
                            {selectedPedido.dni_cliente}
                          </p>
                        </div>
                      )}

                      {selectedPedido.telefono_contacto && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            📱 Teléfono de contacto
                          </label>
                          <p className="text-sm font-medium text-gris-oscuro dark:text-gray-100 font-mono">
                            {selectedPedido.telefono_contacto}
                          </p>
                        </div>
                      )}

                      {selectedPedido.direccion_envio && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            📍 {selectedPedido.metodo_entrega === 'contraentrega' ? 'Estación de entrega' : 'Dirección de entrega'}
                          </label>
                          <p className="text-sm font-medium text-gris-oscuro dark:text-gray-100">
                            {selectedPedido.direccion_envio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notas de entrega */}
                    {selectedPedido.notas_entrega && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-500">
                        <label className="flex items-center space-x-1 text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          <span>📝</span>
                          <span>Notas de entrega</span>
                        </label>
                        <p className="text-sm text-yellow-900 dark:text-yellow-100">
                          {selectedPedido.notas_entrega}
                        </p>
                      </div>
                    )}

                    {/* Alerta si no hay información de entrega */}
                    {!selectedPedido.metodo_entrega && !selectedPedido.telefono_contacto && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-400 dark:border-orange-500">
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          ⚠️ Este pedido no tiene información de entrega registrada (pedido antiguo).
                        </p>
                      </div>
                    )}
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
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gris-oscuro">Total:</span>
                      <span className="text-dorado">{formatPrice(selectedPedido.total)}</span>
                    </div>
                  </div>

                  {/* Acciones Rápidas con Email y cambios de estado */}
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    {/* Cambios de estado básicos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-3">
                        Cambiar estado:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={async () => {
                              const res = await fetch('/api/admin?action=orders', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: selectedPedido.id, updates: { estado: 'pendiente' } })
                              })
                              if (res.ok) {
                                fetchPedidos()
                                closeWithAnimation('modal')
                              }
                            }}
                          disabled={selectedPedido.estado === 'pendiente'}
                          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            selectedPedido.estado === 'pendiente'
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-orange-600 text-white hover:bg-orange-700'
                          }`}
                        >
                          <Package className="w-4 h-4" />
                          <span>Pendiente</span>
                        </button>
                        
                        <button
                          onClick={async () => {
                              const res = await fetch('/api/admin?action=orders', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: selectedPedido.id, updates: { estado: 'cancelado' } })
                              })
                              if (res.ok) {
                                fetchPedidos()
                                closeWithAnimation('modal')
                              }
                            }}
                          disabled={selectedPedido.estado === 'cancelado'}
                          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            selectedPedido.estado === 'cancelado'
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>

                    {/* Acciones con email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-3">
                        Acciones con notificación por email:
                      </label>
                      <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleMarcarComoEnviado(selectedPedido)}
                        disabled={selectedPedido.estado === 'enviado' || selectedPedido.estado === 'entregado'}
                        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          selectedPedido.estado === 'enviado' || selectedPedido.estado === 'entregado'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>Marcar como Enviado</span>
                      </button>
                      
                      <button
                        onClick={() => handleMarcarComoEntregado(selectedPedido)}
                        disabled={selectedPedido.estado === 'entregado'}
                        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          selectedPedido.estado === 'entregado'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Marcar como Entregado</span>
                      </button>
                    </div>
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


