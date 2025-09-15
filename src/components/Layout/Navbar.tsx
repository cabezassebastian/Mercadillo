import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUser, UserButton } from '@clerk/clerk-react'
import { ShoppingCart, Menu, X, Search } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

const Navbar: React.FC = () => {
  const { user } = useUser()
  const { isAdmin } = useAuth()
  const { getTotalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Detectar si estamos en la página de inicio
  const isHomePage = location.pathname === '/'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
    } else {
      navigate('/catalogo')
    }
    // Cerrar menú móvil después de hacer búsqueda
    setIsMenuOpen(false)
  }

  const navItems = [
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Sobre nosotros', path: '/sobre-nosotros' },
    { name: 'Contáctanos', path: '/contacto' },
  ]

  // Solo agregar "Inicio" si NO estamos en la página principal
  if (!isHomePage) {
    navItems.unshift({ name: 'Inicio', path: '/' })
  }

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin' })
  }

  return (
    <nav className="bg-blanco dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 relative group">
            <div className="relative overflow-hidden rounded-lg">
              <img src="/logo.jpg" alt="Mercadillo Lima Perú Logo" className="h-16 w-auto transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-0 group-hover:opacity-100 dark:from-black/50 dark:to-black/20 dark:opacity-20 dark:group-hover:opacity-60 transition-all duration-300 rounded-lg"></div>
            </div>
          </Link>

          {/* Desktop Navigation with Conditional Search */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar - Solo en página de inicio */}
            {isHomePage && (
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo focus:border-amarillo transition-all duration-200 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </form>
            )}
            
            {/* Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gris-oscuro dark:text-gray-200 hover:text-dorado dark:hover:text-yellow-400 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Cart */}
            <Link
              to="/carrito"
              className="relative p-2 text-gris-oscuro dark:text-gray-200 hover:text-dorado dark:hover:text-yellow-400 transition-colors duration-200"
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
                  className="text-gris-oscuro dark:text-gray-200 hover:text-dorado dark:hover:text-yellow-400 transition-colors duration-200 font-medium"
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
              className="md:hidden p-2 text-gris-oscuro dark:text-gray-200 hover:text-dorado dark:hover:text-yellow-400 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search Bar - Solo en página de inicio */}
              {isHomePage && (
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo focus:border-amarillo transition-all duration-200 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </form>
              )}
              
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gris-oscuro dark:text-gray-200 hover:text-dorado dark:hover:text-yellow-400 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {!user && (
                <>
                  <Link
                    to="/sign-in"
                    className="text-gris-oscuro dark:text-gray-200 hover:text-dorado dark:hover:text-yellow-400 transition-colors duration-200 font-medium"
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


