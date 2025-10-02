import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock, Home, RefreshCw } from 'lucide-react'

const CheckoutPending: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Obtener parámetros de Mercado Pago
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          
          <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Pago Pendiente
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Tu pago está siendo procesado
          </p>

          {paymentId && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Detalles del Pago
              </h3>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <p><strong>ID de Pago:</strong> {paymentId}</p>
                {status && <p><strong>Estado:</strong> {status}</p>}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
              ¿Qué está pasando?
            </h3>
            <div className="text-gray-600 dark:text-gray-400 space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Tu pago está siendo verificado por Mercado Pago</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Este proceso puede tomar unos minutos</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Recibirás una notificación cuando se complete</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Puedes cerrar esta página sin problemas</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 <strong>Consejo:</strong> Guarda el ID de pago para futuras consultas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <button
              onClick={() => navigate('/perfil/pedidos')}
              className="btn-primary w-full sm:w-auto px-8 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ver Estado del Pedido</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full sm:w-auto px-8 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿Tienes dudas sobre tu pago?{' '}
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

export default CheckoutPending