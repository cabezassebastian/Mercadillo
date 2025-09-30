import React, { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import MercadoPagoCheckout from '@/components/Checkout/MercadoPagoCheckout'
import { CreditCard, User, ShoppingBag, MapPin, Plus } from 'lucide-react'
import { getUserAddresses, type UserAddress } from '@/lib/userProfile'
import { useNotificationHelpers } from '@/contexts/NotificationContext'

const Checkout: React.FC = () => {
  const { items } = useCart()
  const { user } = useUser()
  const navigate = useNavigate()
  const { showOrderSuccess, showPaymentError } = useNotificationHelpers()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    terminos: false
  })

  // Cargar direcciones del usuario
  useEffect(() => {
    if (user?.id) {
      loadAddresses()
    }
  }, [user?.id])

  const loadAddresses = async () => {
    if (!user?.id) return
    
    const result = await getUserAddresses(user.id)
    if (!result.error && result.data) {
      setAddresses(result.data)
      // Seleccionar automáticamente la dirección predeterminada
      const defaultAddress = result.data.find(addr => addr.es_predeterminada)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress)
        setFormData(prev => ({
          ...prev,
          direccion: `${defaultAddress.direccion_completa}, ${defaultAddress.distrito ? defaultAddress.distrito + ', ' : ''}${defaultAddress.provincia}, ${defaultAddress.departamento}${defaultAddress.codigo_postal ? ' - ' + defaultAddress.codigo_postal : ''}`
        }))
      }
    }
  }

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

  const handleAddressSelect = (address: UserAddress) => {
    setSelectedAddress(address)
    setUseNewAddress(false)
    setFormData(prev => ({
      ...prev,
      direccion: `${address.direccion_completa}, ${address.distrito ? address.distrito + ', ' : ''}${address.provincia}, ${address.departamento}${address.codigo_postal ? ' - ' + address.codigo_postal : ''}`
    }))
  }

  const handleNewAddress = () => {
    setSelectedAddress(null)
    setUseNewAddress(true)
    setFormData(prev => ({
      ...prev,
      direccion: ''
    }))
  }

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)
    const orderNumber = paymentData.payment_id || Date.now().toString()
    showOrderSuccess(orderNumber)
    navigate('/checkout/success')
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    showPaymentError(error.message || 'Error procesando el pago')
    // Mantener al usuario en la página para que pueda intentar de nuevo
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
                  
                  {/* Selector de direcciones guardadas */}
                  {addresses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Direcciones guardadas:
                      </h4>
                      <div className="space-y-2">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                              selectedAddress?.id === address.id
                                ? 'border-amarillo dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={() => handleAddressSelect(address)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {address.nombre}
                                  </span>
                                  {address.es_predeterminada && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                      Predeterminada
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {address.direccion_completa}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                  {address.distrito && `${address.distrito}, `}{address.provincia}, {address.departamento}
                                  {address.codigo_postal && ` - ${address.codigo_postal}`}
                                </p>
                              </div>
                              <input
                                type="radio"
                                name="address"
                                checked={selectedAddress?.id === address.id}
                                onChange={() => handleAddressSelect(address)}
                                className="mt-1 text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                              />
                            </div>
                          </div>
                        ))}
                        
                        {/* Opción para nueva dirección */}
                        <div
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                            useNewAddress
                              ? 'border-amarillo dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          onClick={handleNewAddress}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Plus className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                Usar nueva dirección
                              </span>
                            </div>
                            <input
                              type="radio"
                              name="address"
                              checked={useNewAddress}
                              onChange={handleNewAddress}
                              className="text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campo de dirección manual */}
                  {(useNewAddress || addresses.length === 0) && (
                    <textarea
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="input-field"
                      placeholder="Ingresa tu dirección completa de entrega"
                    />
                  )}

                  {/* Link para gestionar direcciones */}
                  {addresses.length > 0 && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => navigate('/profile/addresses')}
                        className="text-sm text-amarillo dark:text-yellow-400 hover:underline"
                      >
                        Gestionar mis direcciones
                      </button>
                    </div>
                  )}
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


