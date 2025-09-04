import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { CreditCard, MapPin, User, Phone, Mail } from 'lucide-react'

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { items, getSubtotal, getIGV, getTotal, clearCart } = useCart()
  const { user, updateUser } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    direccion: user?.direccion || '',
    telefono: user?.telefono || '',
    metodoPago: 'stripe',
    terminos: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.terminos) {
      alert('Debes aceptar los términos y condiciones')
      return
    }

    setIsProcessing(true)

    try {
      // Actualizar datos del usuario si es necesario
      if (formData.direccion !== user?.direccion || formData.telefono !== user?.telefono) {
        await updateUser({
          direccion: formData.direccion,
          telefono: formData.telefono
        })
      }

      // Crear sesión de pago
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
            precio: item.producto.precio,
            nombre: item.producto.nombre,
            imagen: item.producto.imagen
          })),
          total: getTotal(),
          direccion: formData.direccion,
          metodo_pago: formData.metodoPago
        })
      })

      if (!response.ok) {
        throw new Error('Error al procesar el pago')
      }

      const { url } = await response.json()
      
      // Redirigir a Stripe
      window.location.href = url

    } catch (error) {
      console.error('Error en checkout:', error)
      alert('Error al procesar el pago. Inténtalo de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-hueso py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro mb-8">
          Finalizar Compra
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de envío */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gris-oscuro mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-amarillo" />
                Información de Envío
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={`${user?.nombre || ''} ${user?.apellido || ''}`}
                    disabled
                    className="input-field bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="+51 999 999 999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro mb-2">
                    Dirección de Envío
                  </label>
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="input-field"
                    placeholder="Ingresa tu dirección completa"
                  />
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gris-oscuro mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-amarillo" />
                Método de Pago
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg">
                  <input
                    type="radio"
                    id="stripe"
                    name="metodoPago"
                    value="stripe"
                    checked={formData.metodoPago === 'stripe'}
                    onChange={handleInputChange}
                    className="text-amarillo"
                  />
                  <label htmlFor="stripe" className="flex-1">
                    <div className="font-medium text-gris-oscuro">Tarjeta de Crédito/Débito</div>
                    <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg">
                  <input
                    type="radio"
                    id="mercadopago"
                    name="metodoPago"
                    value="mercadopago"
                    checked={formData.metodoPago === 'mercadopago'}
                    onChange={handleInputChange}
                    className="text-amarillo"
                  />
                  <label htmlFor="mercadopago" className="flex-1">
                    <div className="font-medium text-gris-oscuro">Mercado Pago</div>
                    <div className="text-sm text-gray-600">Pago con cuenta Mercado Pago</div>
                  </label>
                </div>
              </div>
            </div>

            {/* Términos y condiciones */}
            <div className="card p-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terminos"
                  name="terminos"
                  checked={formData.terminos}
                  onChange={handleInputChange}
                  required
                  className="mt-1 text-amarillo"
                />
                <label htmlFor="terminos" className="text-sm text-gray-600">
                  Acepto los{' '}
                  <a href="/terminos" className="text-amarillo hover:underline">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="/privacidad" className="text-amarillo hover:underline">
                    política de privacidad
                  </a>
                </label>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gris-oscuro mb-6">
                Resumen del Pedido
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.producto.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gris-oscuro text-sm">
                        {item.producto.nombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.cantidad}
                      </p>
                    </div>
                    <span className="font-medium text-dorado">
                      {formatPrice(item.producto.precio * item.cantidad)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatPrice(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IGV (18%):</span>
                  <span className="font-medium">{formatPrice(getIGV())}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gris-oscuro">Total:</span>
                  <span className="text-dorado">{formatPrice(getTotal())}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn-primary py-4 text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Procesando...' : 'Finalizar Compra'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout


