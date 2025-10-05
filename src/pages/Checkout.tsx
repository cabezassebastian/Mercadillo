import React, { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import MercadoPagoCheckout from '@/components/Checkout/MercadoPagoCheckout'
import { CreditCard, User, ShoppingBag, MapPin, Plus } from 'lucide-react'
import { getUserAddresses, type UserAddress, updateUserDNI } from '@/lib/userProfile'
import { useNotificationHelpers } from '@/contexts/NotificationContext'

const Checkout: React.FC = () => {
  const { items } = useCart()
  const { user } = useUser()
  const navigate = useNavigate()
  const { showOrderSuccess, showPaymentError } = useNotificationHelpers()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [dniSaved, setDniSaved] = useState(false)
  const [formData, setFormData] = useState<{
    nombre: string
    dni: string
    telefono: string
    direccion: string
    metodoEntrega: 'envio' | 'contraentrega' | 'tienda'
    terminos: boolean
  }>({
    nombre: '',
    dni: '',
    telefono: '',
    direccion: '',
    metodoEntrega: 'envio',
    terminos: false
  })

  // Limpiar DNI cuando se cambia el método de entrega a contraentrega o tienda
  useEffect(() => {
    if (formData.metodoEntrega === 'contraentrega' || formData.metodoEntrega === 'tienda') {
      setFormData(prev => ({ ...prev, dni: '' }))
      setDniSaved(false)
    }
  }, [formData.metodoEntrega])

  // Guardar DNI cuando esté completo (solo para envío a domicilio)
  useEffect(() => {
    const saveDNI = async () => {
      if (user?.id && formData.dni.length === 8 && !dniSaved && formData.metodoEntrega === 'envio') {
        const result = await updateUserDNI(user.id, formData.dni)
        if (result.success) {
          setDniSaved(true)
          console.log('✅ DNI guardado en la base de datos')
        } else {
          console.error('Error al guardar DNI:', result.error)
        }
      }
    }
    saveDNI()
  }, [user?.id, formData.dni, dniSaved, formData.metodoEntrega])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    // Validación especial para DNI
    if (name === 'dni') {
      // Solo permitir números
      const dniRegex = /^\d*$/
      if (!dniRegex.test(value)) {
        return // No actualizar si contiene caracteres no numéricos
      }
      // Limitar a 8 dígitos
      if (value.length > 8) {
        return
      }
    }
    
    // Validación especial para el campo de teléfono
    if (name === 'telefono') {
      // Solo permitir números, espacios y el símbolo +
      const phoneRegex = /^[\d\s+]*$/
      if (!phoneRegex.test(value)) {
        return // No actualizar si contiene caracteres inválidos
      }
      // Limitar a 25 caracteres
      if (value.length > 25) {
        return
      }
    }
    
    // Validación para nombre (máximo 100 caracteres)
    if (name === 'nombre' && value.length > 100) {
      return
    }
    
    // Validación para dirección (máximo 255 caracteres)
    if (name === 'direccion' && value.length > 255) {
      return
    }
    
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
                    maxLength={100}
                    className="input-field"
                    placeholder="Ingresa tu nombre completo"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.nombre.length}/100 caracteres
                  </p>
                </div>

                {/* DNI - Solo requerido para envío a domicilio */}
                {formData.metodoEntrega === 'envio' && (
                  <div>
                    <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                      DNI <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      required
                      maxLength={8}
                      pattern="\d{8}"
                      className="input-field"
                      placeholder="12345678"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.dni.length}/8 dígitos
                    </p>
                  </div>
                )}

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
                    maxLength={25}
                    pattern="[\d\s+]*"
                    className="input-field"
                    placeholder="+51 999 999 999"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.telefono.length}/25 caracteres (solo números y +)
                  </p>
                </div>

                {/* Método de Entrega */}
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-3">
                    Método de Entrega
                  </label>
                  <div className="space-y-3">
                    {/* Envío a domicilio */}
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.metodoEntrega === 'envio'
                          ? 'border-amarillo dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, metodoEntrega: 'envio' }))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="w-5 h-5 text-amarillo dark:text-yellow-400" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              Envío a domicilio
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Entrega a través de Olva Courier (3-5 días hábiles)
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="metodoEntrega"
                          value="envio"
                          checked={formData.metodoEntrega === 'envio'}
                          onChange={(e) => setFormData(prev => ({ ...prev, metodoEntrega: e.target.value as 'envio' | 'contraentrega' | 'tienda' }))}
                          className="mt-1 text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                        />
                      </div>
                    </div>

                    {/* Pago contra entrega - Tren Línea 1 */}
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.metodoEntrega === 'contraentrega'
                          ? 'border-amarillo dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, metodoEntrega: 'contraentrega' }))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <CreditCard className="w-5 h-5 text-amarillo dark:text-yellow-400" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              Pago contra entrega - Tren Línea 1
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pagas cuando recibes el producto en estación del tren
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="metodoEntrega"
                          value="contraentrega"
                          checked={formData.metodoEntrega === 'contraentrega'}
                          onChange={(e) => setFormData(prev => ({ ...prev, metodoEntrega: e.target.value as 'envio' | 'contraentrega' | 'tienda' }))}
                          className="mt-1 text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                        />
                      </div>
                    </div>

                    {/* Recojo en tienda */}
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.metodoEntrega === 'tienda'
                          ? 'border-amarillo dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, metodoEntrega: 'tienda' }))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <ShoppingBag className="w-5 h-5 text-amarillo dark:text-yellow-400" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              Recojo en tienda
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Retira tu pedido en nuestra tienda física
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="metodoEntrega"
                          value="tienda"
                          checked={formData.metodoEntrega === 'tienda'}
                          onChange={(e) => setFormData(prev => ({ ...prev, metodoEntrega: e.target.value as 'envio' | 'contraentrega' | 'tienda' }))}
                          className="mt-1 text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dirección - No mostrar para recojo en tienda */}
                {formData.metodoEntrega !== 'tienda' && (
                  <div>
                    <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                      {formData.metodoEntrega === 'envio' ? 'Dirección de Envío' : 'Estación de Entrega (Línea 1)'}
                      <span className="text-red-500 ml-1">*</span>
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
                    <div>
                      <textarea
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        maxLength={255}
                        className="input-field"
                        placeholder={
                          formData.metodoEntrega === 'envio' 
                            ? "Ingresa tu dirección completa de entrega" 
                            : "Indica la estación del Tren Línea 1 (ej: Villa El Salvador, San Juan, etc.)"
                        }
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.direccion.length}/255 caracteres
                      </p>
                    </div>
                  )}

                  {/* Link para gestionar direcciones */}
                  {addresses.length > 0 && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => navigate('/perfil/direcciones')}
                        className="text-sm text-amarillo dark:text-yellow-400 hover:underline"
                      >
                        Gestionar mis direcciones
                      </button>
                    </div>
                  )}
                  </div>
                )}
              </div>
            </div>

            {/* Términos y condiciones */}
            <div className="card p-6">
              <label 
                htmlFor="terminos" 
                className="flex items-start space-x-3 cursor-pointer group"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="terminos"
                    name="terminos"
                    checked={formData.terminos}
                    onChange={handleInputChange}
                    required
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 peer-checked:bg-amarillo dark:peer-checked:bg-yellow-400 peer-checked:border-amarillo dark:peer-checked:border-yellow-400 transition-all duration-200 flex items-center justify-center group-hover:border-amarillo dark:group-hover:border-yellow-400">
                    {formData.terminos && (
                      <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 select-none">
                  Acepto los{' '}
                  <a 
                    href="/terminos" 
                    className="text-amarillo dark:text-yellow-400 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a 
                    href="/privacidad" 
                    className="text-amarillo dark:text-yellow-400 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    política de privacidad
                  </a>
                </span>
              </label>
            </div>
          </div>

          {/* Componente de Mercado Pago */}
          <div className="space-y-6">
            {formData.terminos && 
             formData.nombre && 
             (formData.metodoEntrega === 'envio' ? (formData.dni && formData.dni.length === 8) : true) &&
             formData.telefono && 
             (formData.metodoEntrega !== 'tienda' ? formData.direccion : true) ? (
              <MercadoPagoCheckout
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                shippingAddress={formData.direccion}
                deliveryData={{
                  nombreCompleto: formData.nombre,
                  dni: formData.dni,
                  telefono: formData.telefono,
                  direccion: formData.direccion,
                  metodoEntrega: formData.metodoEntrega
                }}
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
                {formData.dni && formData.dni.length !== 8 && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2">
                    El DNI debe tener exactamente 8 dígitos.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout


