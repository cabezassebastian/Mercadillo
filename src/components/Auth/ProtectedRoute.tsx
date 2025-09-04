import React from 'react'
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

  // Mostrar loading mientras se cargan los datos
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amarillo"></div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  // Si requiere admin y no es admin, mostrar error
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gris-oscuro mb-4">
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


