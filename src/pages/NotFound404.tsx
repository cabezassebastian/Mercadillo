import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, ShoppingBag, Package } from 'lucide-react'

const NotFound404: React.FC = () => {
  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 text-center">
        
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-[200px] sm:text-[250px] font-bold text-gray-200 dark:text-gray-700 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-amarillo dark:bg-yellow-500 rounded-full p-8 shadow-xl animate-bounce">
              <Package className="w-16 h-16 text-gris-oscuro dark:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gris-oscuro dark:text-gray-100">
            ¡Oops!
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 dark:text-gray-400">
            Página no encontrada
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            Lo sentimos, no pudimos encontrar la página que buscas. 
            Puede que haya sido movida, eliminada o que la URL sea incorrecta.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
            ¿Qué puedes hacer?
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amarillo dark:bg-yellow-500 rounded-full"></div>
              <span>Verifica que la URL esté escrita correctamente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amarillo dark:bg-yellow-500 rounded-full"></div>
              <span>Regresa a la página de inicio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amarillo dark:bg-yellow-500 rounded-full"></div>
              <span>Busca el producto que necesitas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amarillo dark:bg-yellow-500 rounded-full"></div>
              <span>Explora nuestro catálogo completo</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 btn-primary flex items-center justify-center space-x-2 py-3"
            >
              <Home className="w-5 h-5" />
              <span>Ir al Inicio</span>
            </Link>
            <Link
              to="/catalogo"
              className="flex-1 btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ver Catálogo</span>
            </Link>
          </div>
          
          <button
            onClick={() => window.history.back()}
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gris-oscuro dark:hover:text-gray-200 font-medium py-2 flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver atrás</span>
          </button>
        </div>

        {/* Contact Info */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            ¿Necesitas ayuda?
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <a 
              href="tel:+51977933410" 
              className="text-amarillo hover:text-dorado font-medium transition-colors duration-200"
            >
              +51 977 933 410
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link 
              to="/contacto" 
              className="text-amarillo hover:text-dorado font-medium transition-colors duration-200"
            >
              Contactar soporte
            </Link>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="bg-gradient-to-r from-amarillo/10 to-dorado/10 dark:from-yellow-500/10 dark:to-yellow-400/10 rounded-lg p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <strong>Dato curioso:</strong> Nuestro catálogo tiene más de 100 productos únicos esperándote en El Agustino, Lima Este.
          </p>
        </div>

      </div>
    </div>
  )
}

export default NotFound404