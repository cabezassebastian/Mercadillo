import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Producto } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import Logo from '@/components/Layout/Logo'
import SearchWithSuggestions from '@/components/Search/SearchWithSuggestions'
import UserProfileMenu from '@/components/User/UserProfileMenu'

const Navbar: React.FC = () => {
  const { user } = useUser()
  const { isAdmin } = useAuth()
  const { getTotalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [allProducts, setAllProducts] = useState<Producto[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  // Detectar si estamos en la página de inicio
  const isHomePage = location.pathname === '/'

  // Fetch all products for search suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let productsQuery = supabase.from('productos').select('*').gt('stock', 0)
        let { data, error } = await productsQuery.order('created_at', { ascending: false })

        if (error) {
          // If sorting by created_at fails, try without sorting
          const { data: fallbackData, error: fallbackError } = await productsQuery
          if (!fallbackError) {
            setAllProducts(fallbackData || [])
          }
        } else {
          setAllProducts(data || [])
        }
      } catch (err) {
        console.error('Error loading products for search:', err)
      }
    }

    fetchProducts()
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Handle search - redirect to catalog with search term
  const handleSearch = (term: string) => {
    if (term.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(term.trim())}`)
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
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Logo size="navbar" className="flex-shrink-0" />

          {/* Desktop Navigation with Conditional Search */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar - Solo en página de inicio */}
            {isHomePage && (
              <div className="w-80">
                <SearchWithSuggestions
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSearch={handleSearch}
                  productos={allProducts}
                  placeholder="Buscar productos..."
                />
              </div>
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
                <UserProfileMenu />
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
                <div className="w-full">
                  <SearchWithSuggestions
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onSearch={handleSearch}
                    productos={allProducts}
                    placeholder="Buscar productos..."
                  />
                </div>
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


