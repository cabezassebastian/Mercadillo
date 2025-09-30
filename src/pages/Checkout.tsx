import React, { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import MercadoPagoCheckout from '@/components/Checkout/MercadoPagoCheckout'
import { CreditCard, User, ShoppingBag } from 'lucide-react'

const Checkout: React.FC = () => {
  const { items, getSubtotal, getTotal } = useCart()
  const { user } = useUser()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    terminos: false
  })

  // Actualizar form data cuando los datos del usuario estén disponibles
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.fullName || user.firstName || prev.nombre,
        telefono: user.phoneNumbers[0]?.phoneNumber || prev.telefono,
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)
    navigate('/checkout/success')
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    // Mantener al usuario en la página para que pueda intentar de nuevo
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  // Redireccionar si no hay items en el carrito
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Agrega productos a tu carrito para continuar con la compra
          </p>
          <button
            onClick={() => navigate('/catalogo')}
            className="btn-primary"
          >
            Ver Catálogo
          </button>
        </div>
      </div>
    )
  }

  // Verificar si el usuario está autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Inicia sesión para continuar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Necesitas iniciar sesión para completar tu compra
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="btn-primary"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-8">
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información de envío */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gris-oscuro dark:text-gray-100 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-amarillo dark:text-yellow-400" />
                Información de Envío
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.emailAddresses[0]?.emailAddress || ''}
                    disabled
                    className="input-field bg-gray-100 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
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
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Dirección de Envío
                  </label>
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="input-field"
                    placeholder="Ingresa tu dirección completa de entrega"
                  />
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
                  className="mt-1 text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="terminos" className="text-sm text-gray-600 dark:text-gray-400">
                  Acepto los{' '}
                  <a href="/terminos" className="text-amarillo dark:text-yellow-400 hover:underline">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="/privacidad" className="text-amarillo dark:text-yellow-400 hover:underline">
                    política de privacidad
                  </a>
                </label>
              </div>
            </div>
          </div>

          {/* Componente de Mercado Pago */}
          <div className="space-y-6">
            {formData.terminos && formData.nombre && formData.telefono && formData.direccion ? (
              <MercadoPagoCheckout
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Completa la información
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Completa todos los campos requeridos y acepta los términos para continuar con el pago.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout


