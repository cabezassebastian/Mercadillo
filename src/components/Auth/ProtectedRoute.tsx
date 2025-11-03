import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isLoaded } = useUser()
  const { isAdmin, isLoading } = useAuth()
  const location = useLocation()

  // Efecto para redirigir después del login exitoso
  useEffect(() => {
    if (isLoaded && user && location.state?.from) {
      // Si el usuario se autentica y hay una URL de origen, podríamos redirigir
      // Pero React Router ya maneja esto automáticamente
    }
  }, [isLoaded, user, location.state])

  // Mostrar loading mientras se cargan los datos
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hueso dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo dark:border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gris-claro dark:text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!user) {
    const redirectPath = location.pathname === '/checkout' ? '/sign-in' : '/sign-in'
    const message = location.pathname === '/checkout' 
      ? 'Debes iniciar sesión para proceder con el pago'
      : 'Debes iniciar sesión para acceder a esta página'
      
    return <Navigate to={redirectPath} state={{ from: location.pathname, message }} replace />
  }

  // Si requiere admin y no es admin, mostrar error
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute


