import React, { useState, useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { 
  User, 
  ChevronDown, 
  Heart, 
  Package, 
  Star, 
  Clock, 
  MapPin, 
  LogOut,
  Settings
} from 'lucide-react'

interface UserProfileMenuProps {
  className?: string
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ className = '' }) => {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!isLoaded || !user) {
    return null
  }

  const handleSignOut = () => {
    signOut()
    setIsOpen(false)
  }

  const menuItems = [
    {
      icon: Heart,
      label: 'Lista de Deseos',
      path: '/profile/wishlist',
      description: 'Productos guardados'
    },
    {
      icon: Package,
      label: 'Mis Pedidos',
      path: '/profile/orders',
      description: 'Historial de compras'
    },
    {
      icon: Star,
      label: 'Mis Reseñas',
      path: '/profile/reviews',
      description: 'Reseñas escritas'
    },
    {
      icon: Clock,
      label: 'Historial',
      path: '/profile/history',
      description: 'Productos visitados'
    },
    {
      icon: MapPin,
      label: 'Direcciones',
      path: '/profile/addresses',
      description: 'Direcciones de envío'
    }
  ]

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center space-x-2 px-3 py-2 rounded-lg
          text-gray-700 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
        aria-label="Menu de perfil"
      >
        {user.imageUrl ? (
          <img 
            src={user.imageUrl} 
            alt={user.fullName || 'Usuario'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        
        <span className="hidden md:block font-medium">
          {user.firstName || 'Usuario'}
        </span>
        
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="
            absolute right-0 mt-2 w-80 z-50
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-xl
            py-2
          ">
            {/* Header del perfil */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {user.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'Usuario'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user.fullName || `${user.firstName} ${user.lastName}`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="
                      flex items-center px-4 py-3
                      text-gray-700 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-700
                      transition-colors duration-200
                      group
                    "
                  >
                    <Icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Additional options */}
            <div className="py-2">
              <Link
                to="/profile/settings"
                onClick={() => setIsOpen(false)}
                className="
                  flex items-center px-4 py-2
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-colors duration-200
                  group
                "
              >
                <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span className="font-medium">Configuración</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="
                  w-full flex items-center px-4 py-2
                  text-gray-700 dark:text-gray-200
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  hover:text-red-600 dark:hover:text-red-400
                  transition-colors duration-200
                  group
                "
              >
                <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserProfileMenu