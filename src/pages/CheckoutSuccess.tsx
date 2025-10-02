import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, Home } from 'lucide-react'

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Obtener parámetros de Mercado Pago
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    // Log para debugging
    console.log('Checkout Success params:', { paymentId, status, externalReference })
  }, [paymentId, status, externalReference])

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Tu pedido ha sido procesado correctamente
          </p>

          {paymentId && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Detalles del Pago
              </h3>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <p><strong>ID de Pago:</strong> {paymentId}</p>
                {status && <p><strong>Estado:</strong> {status}</p>}
                {externalReference && <p><strong>Referencia:</strong> {externalReference}</p>}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <Package className="w-12 h-12 text-amarillo dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-2">
              ¿Qué sigue?
            </h3>
            <div className="text-gray-600 dark:text-gray-400 space-y-2 text-sm">
              <p>✓ Recibirás un email de confirmación</p>
              <p>✓ Prepararemos tu pedido para envío</p>
              <p>✓ Te notificaremos cuando esté en camino</p>
              <p>✓ Podrás seguir tu pedido desde tu perfil</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <button
              onClick={() => navigate('/perfil/pedidos')}
              className="btn-primary w-full sm:w-auto px-8 flex items-center justify-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Ver mis Pedidos</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full sm:w-auto px-8 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess