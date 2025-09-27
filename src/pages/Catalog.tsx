import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Grid, List, X,
  Smartphone, Shirt, Home, Dumbbell, 
  Book, Package, ShoppingBag, Star, SlidersHorizontal 
} from 'lucide-react'
import { supabase, Producto } from '@/lib/supabase'
import ProductCard from '@/components/Product/ProductCard'
import SearchWithSuggestions from '@/components/Search/SearchWithSuggestions'

const Catalog: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('nombre')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [searchParams, setSearchParams] = useSearchParams()

  // Definir categorías con iconos
  const categoriesConfig = [
    { name: 'Todos', icon: ShoppingBag, value: '' },
    { name: 'Electrónicos', icon: Smartphone, value: 'Electrónicos' },
    { name: 'Ropa', icon: Shirt, value: 'Ropa' },
    { name: 'Hogar', icon: Home, value: 'Hogar' },
    { name: 'Deportes', icon: Dumbbell, value: 'Deportes' },
    { name: 'Libros', icon: Book, value: 'Libros' },
    { name: 'Otros', icon: Package, value: 'Otros' },
  ]

  // Obtener término de búsqueda de la URL al cargar
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search')
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let productsQuery = supabase.from('productos').select('*').gt('stock', 0)
        let { data, error: supabaseError } = await productsQuery.order('created_at', { ascending: false })

        if (supabaseError) {
          // Si falla la ordenación por created_at, intentar sin ordenación
          const { data: fallbackData, error: fallbackError } = await productsQuery

          if (fallbackError) {
            setError('No se pudo cargar la información del catálogo, inténtalo más tarde')
            setProductos([])
            setFilteredProductos([])
            return
          }
          data = fallbackData
        }

        setProductos(data || [])
        setFilteredProductos(data || [])
      } catch (err) {
        console.error('Error en fetchProductos en Catalog:', err)
        setError('Ocurrió un error inesperado al cargar el catálogo.')
        setProductos([]) // Asegura que los productos estén vacíos en caso de error
        setFilteredProductos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductos()
  }, [])

  useEffect(() => {
    let filtered = productos

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(producto => producto.categoria === selectedCategory)
    }

    // Filtrar por rango de precios
    if (priceRange.min) {
      filtered = filtered.filter(producto => producto.precio >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(producto => producto.precio <= parseFloat(priceRange.max))
    }

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      let result = 0
      switch (sortBy) {
        case 'precio-asc':
          // Menor precio primero
          result = a.precio - b.precio
          break
        case 'precio-desc':
          // Mayor precio primero
          result = b.precio - a.precio
          break
        case 'nombre':
          // A-Z alfabético
          result = a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
          break
        case 'stock':
          // Mayor stock primero
          result = b.stock - a.stock
          break
        case 'newest':
          // Más recientes primero
          const dateA = new Date(a.created_at || '').getTime()
          const dateB = new Date(b.created_at || '').getTime()
          result = dateB - dateA
          break
        default:
          // Por defecto ordenar por nombre
          result = a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
          break
      }
      return result
    })

    setFilteredProductos(filtered)
  }, [productos, searchTerm, selectedCategory, sortBy, priceRange])

  const categories = Array.from(new Set(productos.map(p => p.categoria)))

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSearchParams({})
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hueso dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amarillo dark:border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Nuestros Productos
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Descubre los mejores productos de Lima, Perú. Calidad garantizada y envío rápido.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-red-100 dark:bg-red-900 rounded-lg shadow-md max-w-md mx-auto my-4">
            <p className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4">⚠️ Error al cargar el catálogo</p>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Por favor, verifica tu conexión a internet o inténtalo de nuevo más tarde.</p>
          </div>
        )}

        {/* Categories Section */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {categoriesConfig.map(({ name, icon: Icon, value }) => (
              <button
                key={name}
                onClick={() => setSelectedCategory(value)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 min-w-[100px] ${
                  selectedCategory === value
                    ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                }`}
              >
                <Icon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 transition-colors duration-200">
          
          {/* Top Row - Search and Quick Actions */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar with Suggestions */}
            <SearchWithSuggestions
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={(term) => {
                if (term.trim()) {
                  setSearchParams({ search: term.trim() })
                } else {
                  setSearchParams({})
                }
              }}
              productos={productos}
              placeholder="¿Qué estás buscando hoy?"
            />

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Filtros</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gris-oscuro dark:text-gray-200 mb-3">
                    Rango de Precio
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">—</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Filter (Alternative) */}
                <div>
                  <label className="block text-sm font-semibold text-gris-oscuro dark:text-gray-200 mb-3">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-semibold text-gris-oscuro dark:text-gray-200 mb-3">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="nombre">📝 A-Z (Alfabético)</option>
                    <option value="precio-asc">💰 Precio: Menor → Mayor</option>
                    <option value="precio-desc">💎 Precio: Mayor → Menor</option>
                    <option value="newest">🆕 Más Recientes Primero</option>
                    <option value="stock">📦 Mayor Stock Disponible</option>
                  </select>
                </div>

              </div>

              {/* Clear Filters */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gris-oscuro dark:hover:text-gray-200 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar filtros</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gris-oscuro dark:text-gray-200">
                {filteredProductos.length}
              </span> 
              {' '}de{' '}
              <span className="font-semibold text-gris-oscuro dark:text-gray-200">
                {productos.length}
              </span> 
              {' '}productos
            </p>
            {selectedCategory && (
              <p className="text-sm text-amarillo dark:text-yellow-400 mt-1">
                Categoría: <span className="font-medium">{selectedCategory}</span>
              </p>
            )}
          </div>

          {/* Rating/Quality Badge */}
          <div className="hidden md:flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-green-600 dark:text-green-400 fill-current" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Calidad garantizada
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProductos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
              No encontramos productos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Intenta ajustar tus filtros de búsqueda o explora nuestras categorías más populares.
            </p>
            <button
              onClick={clearAllFilters}
              className="btn-primary px-6 py-3"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 pb-12 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {filteredProductos.map((producto) => (
              <div key={producto.id} className="transform hover:scale-105 transition-transform duration-200">
                <ProductCard producto={producto} viewMode={viewMode} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalog


