import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ShoppingCart } from 'lucide-react'

interface CheckoutButtonProps {
  className?: string
  children?: React.ReactNode
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  className = "w-full btn-primary text-center py-3 text-lg block",
  children = "Proceder al Pago"
}) => {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!isLoaded) {
      // Todavía cargando, no hacer nada
      return
    }

    if (!user) {
      // Usuario no autenticado, redirigir a login
      navigate('/sign-in', { 
        state: { 
          from: '/checkout',
          message: 'Debes iniciar sesión para proceder con el pago' 
        } 
      })
      return
    }

    // Usuario autenticado, ir al checkout
    navigate('/checkout')
  }

  if (!isLoaded) {
    return (
      <button
        disabled
        className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Cargando...</span>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleCheckout}
      className={className}
    >
      <div className="flex items-center justify-center space-x-2">
        <ShoppingCart className="w-5 h-5" />
        <span>{children}</span>
      </div>
    </button>
  )
}

export default CheckoutButton