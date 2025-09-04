import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser, UserButton } from '@clerk/clerk-react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

const Navbar: React.FC = () => {
  const { user } = useUser()
  const { isAdmin } = useAuth()
  const { getTotalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
  ]

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin' })
  }

  return (
    <nav className="bg-blanco shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="Mercadillo Lima Perú Logo" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gris-oscuro hover:text-dorado transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/carrito"
              className="relative p-2 text-gris-oscuro hover:text-dorado transition-colors duration-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-amarillo text-gris-oscuro text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/sign-in"
                  className="text-gris-oscuro hover:text-dorado transition-colors duration-200 font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/sign-up"
                  className="btn-primary"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gris-oscuro hover:text-dorado transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gris-oscuro hover:text-dorado transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {!user && (
                <>
                  <Link
                    to="/sign-in"
                    className="text-gris-oscuro hover:text-dorado transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/sign-up"
                    className="btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar


