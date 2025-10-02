import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { XCircle, Home, ShoppingCart } from 'lucide-react'

const CheckoutFailure: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Obtener parámetros de Mercado Pago
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          
          <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Pago No Completado
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Hubo un problema al procesar tu pago
          </p>

          {paymentId && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Información del Error
              </h3>
              <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {paymentId && <p><strong>ID de Pago:</strong> {paymentId}</p>}
                {status && <p><strong>Estado:</strong> {status}</p>}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
              ¿Qué puedes hacer?
            </h3>
            <div className="text-gray-600 dark:text-gray-400 space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amarillo dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Verifica que tus datos de pago sean correctos</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amarillo dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Asegúrate de tener fondos suficientes en tu cuenta</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amarillo dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Intenta nuevamente con otro método de pago</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amarillo dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Contacta a nuestro soporte si el problema persiste</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto px-8"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Intentar de Nuevo</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto px-8"
            >
              <Home className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿Necesitas ayuda?{' '}
              <a 
                href="/contacto" 
                className="text-amarillo dark:text-yellow-400 hover:underline"
              >
                Contacta nuestro soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutFailure