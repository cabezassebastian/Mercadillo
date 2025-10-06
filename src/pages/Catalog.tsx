import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Grid, List, X,
  Smartphone, Shirt, Home, Dumbbell, 
  Book, Package, ShoppingBag, Star, SlidersHorizontal,
  ChevronDown, Flame, TrendingUp, TrendingDown, Clock, Box, ArrowDownAZ, ArrowUpAZ,
  Sparkles, Award, Trophy
} from 'lucide-react'
import { supabase, Producto } from '@/lib/supabase'
import ProductCard from '@/components/Product/ProductCard'
import SearchWithSuggestions from '@/components/Search/SearchWithSuggestions'

// Opciones de ordenamiento con iconos
const sortOptions = [
  { value: 'newest', label: 'Más Recientes', icon: Clock, color: 'text-blue-500 dark:text-blue-400' },
  { value: 'best-sellers', label: 'Más Vendidos', icon: Flame, color: 'text-orange-500 dark:text-orange-400' },
  { value: 'precio-asc', label: 'Menor Precio', icon: TrendingDown, color: 'text-green-500 dark:text-green-400' },
  { value: 'precio-desc', label: 'Mayor Precio', icon: TrendingUp, color: 'text-purple-500 dark:text-purple-400' },
  { value: 'nombre-asc', label: 'A - Z', icon: ArrowDownAZ, color: 'text-indigo-500 dark:text-indigo-400' },
  { value: 'nombre-desc', label: 'Z - A', icon: ArrowUpAZ, color: 'text-pink-500 dark:text-pink-400' },
  { value: 'stock', label: 'Mayor Stock', icon: Box, color: 'text-amber-500 dark:text-amber-400' },
]

// Opciones de calificación mínima con iconos
const ratingOptions = [
  { value: 0, label: 'Todas las calificaciones', icon: Sparkles, color: 'text-gray-500 dark:text-gray-400', stars: '' },
  { value: 4, label: '4+ estrellas', icon: Trophy, color: 'text-yellow-500 dark:text-yellow-400', stars: '⭐⭐⭐⭐' },
  { value: 3, label: '3+ estrellas', icon: Award, color: 'text-orange-500 dark:text-orange-400', stars: '⭐⭐⭐' },
  { value: 2, label: '2+ estrellas', icon: Star, color: 'text-blue-500 dark:text-blue-400', stars: '⭐⭐' },
]

const Catalog: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false) // Drawer mobile
  const [showSortDropdown, setShowSortDropdown] = useState(false) // Dropdown de ordenamiento
  const [showRatingDropdown, setShowRatingDropdown] = useState(false) // Dropdown de calificación
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false) // Dropdown de categoría (mobile)
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [onlyInStock, setOnlyInStock] = useState(true) // Solo productos disponibles
  const [minRating, setMinRating] = useState(0) // Filtro por calificación
  const [searchParams, setSearchParams] = useSearchParams()
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const ratingDropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  // Estado para animaciones de cierre
  const [isClosing, setIsClosing] = useState({
    sort: false,
    rating: false,
    category: false,
    mobileFilters: false
  })

  // Helper para cerrar con animación
  const closeWithAnimation = (type: 'sort' | 'rating' | 'category' | 'mobileFilters') => {
    setIsClosing(prev => ({ ...prev, [type]: true }))
    const duration = type === 'mobileFilters' ? 250 : 150
    setTimeout(() => {
      if (type === 'sort') setShowSortDropdown(false)
      else if (type === 'rating') setShowRatingDropdown(false)
      else if (type === 'category') setShowCategoryDropdown(false)
      else if (type === 'mobileFilters') setShowMobileFilters(false)
      setIsClosing(prev => ({ ...prev, [type]: false }))
    }, duration)
  }

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

        // Obtener imágenes principales para cada producto
        if (data && data.length > 0) {
          const productosConImagenes = await Promise.all(
            data.map(async (producto) => {
              const { data: imagenes } = await supabase
                .from('producto_imagenes')
                .select('url')
                .eq('producto_id', producto.id)
                .eq('es_principal', true)
                .single()
              
              // Si hay imagen principal en la galería, usarla; si no, usar la imagen original
              return {
                ...producto,
                imagen: imagenes?.url || producto.imagen
              }
            })
          )
          setProductos(productosConImagenes)
          setFilteredProductos(productosConImagenes)
        } else {
          setProductos(data || [])
          setFilteredProductos(data || [])
        }
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

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        if (showSortDropdown) closeWithAnimation('sort')
      }
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target as Node)) {
        if (showRatingDropdown) closeWithAnimation('rating')
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        if (showCategoryDropdown) closeWithAnimation('category')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSortDropdown, showRatingDropdown, showCategoryDropdown])

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

    // Filtrar solo productos disponibles
    if (onlyInStock) {
      filtered = filtered.filter(producto => producto.stock > 0)
    }

    // Filtrar por rango de precios
    if (priceRange.min) {
      filtered = filtered.filter(producto => producto.precio >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(producto => producto.precio <= parseFloat(priceRange.max))
    }

    // Filtrar por calificación mínima (si existe el campo)
    if (minRating > 0) {
      filtered = filtered.filter(producto => 
        (producto.rating_promedio || 0) >= minRating
      )
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
        case 'nombre-asc':
          // A-Z alfabético
          result = a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
          break
        case 'nombre-desc':
          // Z-A alfabético
          result = b.nombre.localeCompare(a.nombre, 'es', { sensitivity: 'base' })
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
        case 'best-sellers':
          // Más vendidos (requiere campo total_vendidos)
          result = (b.total_vendidos || 0) - (a.total_vendidos || 0)
          break
        default:
          // Por defecto ordenar por más recientes
          const defDateA = new Date(a.created_at || '').getTime()
          const defDateB = new Date(b.created_at || '').getTime()
          result = defDateB - defDateA
          break
      }
      return result
    })

    setFilteredProductos(filtered)
  }, [productos, searchTerm, selectedCategory, sortBy, priceRange, onlyInStock, minRating])

  // Contar filtros activos
  const activeFiltersCount = [
    selectedCategory,
    priceRange.min,
    priceRange.max,
    !onlyInStock, // Si está desactivado cuenta como filtro
    minRating > 0
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setOnlyInStock(true)
    setMinRating(0)
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

        {/* Categories Pills - Mobile Only */}
        <div className="mb-8 lg:hidden">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categoriesConfig.map(({ name, icon: Icon, value }) => (
              <button
                key={name}
                onClick={() => setSelectedCategory(value)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-[90px] ${
                  selectedCategory === value
                    ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar - Full Width */}
        <div className="mb-6">
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
        </div>

        {/* Mobile Filter Button & Sort */}
        <div className="lg:hidden flex items-center justify-between mb-6 gap-3">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md transition-all duration-200 relative border-2 border-gray-200 dark:border-gray-600 hover:border-amarillo dark:hover:border-yellow-500"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Mobile Custom Sort Button */}
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex-1 flex items-center justify-between px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md font-medium text-sm hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              {(() => {
                const selected = sortOptions.find(opt => opt.value === sortBy)
                const Icon = selected?.icon || Clock
                return (
                  <>
                    <Icon className={`w-4 h-4 ${selected?.color}`} />
                    <span className="truncate">{selected?.label}</span>
                  </>
                )
              })()}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Sort Dropdown */}
        {showSortDropdown && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end">
            <div 
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${
                isClosing.sort ? 'animate-backdrop-closing' : 'animate-backdrop'
              }`}
              onClick={() => closeWithAnimation('sort')}
            />
            <div className={`relative w-full bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto ${
              isClosing.sort ? 'animate-slide-down-closing' : 'animate-slide-up'
            }`}>
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gris-oscuro dark:text-gray-100">Ordenar por</h3>
                  <button
                    onClick={() => closeWithAnimation('sort')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        closeWithAnimation('sort')
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all duration-150 ${
                        sortBy === option.value
                          ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 font-semibold shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${sortBy === option.value ? 'text-gris-oscuro dark:text-gray-900' : option.color}`} />
                      <span className="flex-1">{option.label}</span>
                      {sortBy === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gris-oscuro dark:bg-gray-900" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${
                isClosing.mobileFilters ? 'animate-backdrop-closing' : 'animate-backdrop'
              }`}
              onClick={() => closeWithAnimation('mobileFilters')}
            />
            
            {/* Drawer */}
            <div className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto ${
              isClosing.mobileFilters ? 'animate-slide-out-right-closing' : 'animate-slide-in-right'
            }`}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">
                    Filtros
                  </h2>
                  <button
                    onClick={() => closeWithAnimation('mobileFilters')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Filter Content - Same as Sidebar */}
                <FilterContent
                  onlyInStock={onlyInStock}
                  setOnlyInStock={setOnlyInStock}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categoriesConfig={categoriesConfig}
                  clearAllFilters={clearAllFilters}
                  activeFiltersCount={activeFiltersCount}
                  showRatingDropdown={showRatingDropdown}
                  setShowRatingDropdown={setShowRatingDropdown}
                  showCategoryDropdown={showCategoryDropdown}
                  setShowCategoryDropdown={setShowCategoryDropdown}
                  ratingDropdownRef={ratingDropdownRef}
                  categoryDropdownRef={categoryDropdownRef}
                  isClosingRating={isClosing.rating}
                  isClosingCategory={isClosing.category}
                  onCloseRating={() => closeWithAnimation('rating')}
                  onCloseCategory={() => closeWithAnimation('category')}
                />

                {/* Apply Button */}
                <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    onClick={() => closeWithAnimation('mobileFilters')}
                    className="w-full btn-primary py-3 rounded-xl font-semibold"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Layout: Sidebar + Products Grid */}
        <div className="lg:flex lg:gap-8">
          
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-200 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gris-oscuro dark:text-gray-100">
                  Filtros
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="overflow-y-auto flex-1 p-6 pt-6">
                <FilterContent
                onlyInStock={onlyInStock}
                setOnlyInStock={setOnlyInStock}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categoriesConfig={categoriesConfig}
                clearAllFilters={clearAllFilters}
                activeFiltersCount={activeFiltersCount}
                showRatingDropdown={showRatingDropdown}
                setShowRatingDropdown={setShowRatingDropdown}
                showCategoryDropdown={showCategoryDropdown}
                setShowCategoryDropdown={setShowCategoryDropdown}
                ratingDropdownRef={ratingDropdownRef}
                categoryDropdownRef={categoryDropdownRef}
                isClosingRating={isClosing.rating}
                isClosingCategory={isClosing.category}
                onCloseRating={() => closeWithAnimation('rating')}
                onCloseCategory={() => closeWithAnimation('category')}
              />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* Desktop Sort & View Controls */}
            <div className="hidden lg:flex items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Ordenar por:</span>
                </div>
                
                {/* Custom Dropdown */}
                <div className="relative flex-1 max-w-xs" ref={sortDropdownRef}>
                  <button
                    onClick={() => {
                      if (showSortDropdown) {
                        closeWithAnimation('sort')
                      } else {
                        setShowSortDropdown(true)
                      }
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amarillo dark:focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const selected = sortOptions.find(opt => opt.value === sortBy)
                        const Icon = selected?.icon || Clock
                        return (
                          <>
                            <Icon className={`w-4 h-4 ${selected?.color}`} />
                            <span>{selected?.label}</span>
                          </>
                        )
                      })()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showSortDropdown && (
                    <div className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden ${
                      isClosing.sort ? 'animate-dropdown-closing' : 'animate-dropdown'
                    }`}>
                      {sortOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value)
                              closeWithAnimation('sort')
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-150 ${
                              sortBy === option.value
                                ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 font-semibold'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${sortBy === option.value ? 'text-gris-oscuro dark:text-gray-900' : option.color}`} />
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              <div className="ml-auto">
                                <div className="w-2 h-2 rounded-full bg-gris-oscuro dark:bg-gray-900" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results Count */}
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
                  ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' 
                  : 'grid-cols-1'
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
      </div>
    </div>
  )
}

// FilterContent Component - Reusable for Sidebar and Mobile Drawer
interface FilterContentProps {
  onlyInStock: boolean
  setOnlyInStock: (value: boolean) => void
  priceRange: { min: string; max: string }
  setPriceRange: React.Dispatch<React.SetStateAction<{ min: string; max: string }>>
  minRating: number
  setMinRating: (value: number) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  categoriesConfig: Array<{ name: string; icon: any; value: string }>
  clearAllFilters: () => void
  activeFiltersCount: number
  showRatingDropdown: boolean
  setShowRatingDropdown: (value: boolean) => void
  showCategoryDropdown: boolean
  setShowCategoryDropdown: (value: boolean) => void
  ratingDropdownRef: React.RefObject<HTMLDivElement>
  categoryDropdownRef: React.RefObject<HTMLDivElement>
  isClosingRating: boolean
  isClosingCategory: boolean
  onCloseRating: () => void
  onCloseCategory: () => void
}

const FilterContent: React.FC<FilterContentProps> = ({
  onlyInStock,
  setOnlyInStock,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  selectedCategory,
  setSelectedCategory,
  categoriesConfig,
  clearAllFilters,
  activeFiltersCount,
  showRatingDropdown,
  setShowRatingDropdown,
  showCategoryDropdown,
  setShowCategoryDropdown,
  ratingDropdownRef,
  categoryDropdownRef,
  isClosingRating,
  isClosingCategory,
  onCloseRating,
  onCloseCategory,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Categories - Desktop Sidebar */}
      <div className="hidden lg:block">
        <h3 className="text-sm font-semibold text-gris-oscuro dark:text-gray-200 mb-3">
          Categorías
        </h3>
        <div className="space-y-2">
          {categoriesConfig.map(({ name, icon: Icon, value }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(value)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                selectedCategory === value
                  ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Disponibilidad - Toggle Switch Mejorado */}
      <div>
        <h3 className="text-sm font-semibold text-gris-oscuro dark:text-gray-200 mb-3">
          Disponibilidad
        </h3>
        <button
          onClick={() => setOnlyInStock(!onlyInStock)}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border-2 ${
            onlyInStock
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-md'
              : 'bg-gray-50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              onlyInStock 
                ? 'bg-green-500 dark:bg-green-600' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <Package className={`w-5 h-5 ${
                onlyInStock 
                  ? 'text-white' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium ${
                onlyInStock 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                Solo disponibles
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {onlyInStock ? 'Productos en stock' : 'Todos los productos'}
              </p>
            </div>
          </div>
          <div className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 relative ${
            onlyInStock 
              ? 'bg-green-500 dark:bg-green-600' 
              : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
              onlyInStock ? 'transform translate-x-5' : ''
            }`} />
          </div>
        </button>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gris-oscuro dark:text-gray-200 mb-3">
          Rango de Precio
        </h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm transition-all duration-200"
          />
          <span className="text-gray-500 dark:text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm transition-all duration-200"
          />
        </div>
      </div>

      {/* Calificación Mínima */}
      <div>
        <h3 className="text-sm font-semibold text-gris-oscuro dark:text-gray-200 mb-3">
          Calificación Mínima
        </h3>
        <div className="relative" ref={ratingDropdownRef}>
          <button
            onClick={() => {
              if (showRatingDropdown) {
                onCloseRating()
              } else {
                setShowRatingDropdown(true)
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-medium text-sm hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              {(() => {
                const selected = ratingOptions.find(opt => opt.value === minRating)
                const Icon = selected?.icon || Sparkles
                return (
                  <>
                    <Icon className={`w-4 h-4 ${selected?.color}`} />
                    <span className="truncate">{selected?.stars} {selected?.label}</span>
                  </>
                )
              })()}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${showRatingDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showRatingDropdown && (
            <div className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden ${
              isClosingRating ? 'animate-dropdown-closing' : 'animate-dropdown'
            }`}>
              {ratingOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setMinRating(option.value)
                      onCloseRating()
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-150 ${
                      minRating === option.value
                        ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${minRating === option.value ? 'text-gris-oscuro dark:text-gray-900' : option.color}`} />
                    <span className="flex-1">{option.stars} {option.label}</span>
                    {minRating === option.value && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-gris-oscuro dark:bg-gray-900" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Dropdown - Mobile Only */}
      <div className="lg:hidden">
        <h3 className="text-sm font-semibold text-gris-oscuro dark:text-gray-200 mb-3">
          Categoría
        </h3>
        <div className="relative" ref={categoryDropdownRef}>
          <button
            onClick={() => {
              if (showCategoryDropdown) {
                onCloseCategory()
              } else {
                setShowCategoryDropdown(true)
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-medium text-sm hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              {(() => {
                const selected = categoriesConfig.find(cat => cat.value === selectedCategory)
                const Icon = selected?.icon || ShoppingBag
                return (
                  <>
                    <Icon className="w-4 h-4 text-amarillo dark:text-yellow-400" />
                    <span className="truncate">{selected?.name || 'Todas las categorías'}</span>
                  </>
                )
              })()}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showCategoryDropdown && (
            <div className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden max-h-80 overflow-y-auto ${
              isClosingCategory ? 'animate-dropdown-closing' : 'animate-dropdown'
            }`}>
              {categoriesConfig.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value)
                      onCloseCategory()
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-150 ${
                      selectedCategory === category.value
                        ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${selectedCategory === category.value ? 'text-gris-oscuro dark:text-gray-900' : 'text-amarillo dark:text-yellow-400'}`} />
                    <span className="flex-1">{category.name}</span>
                    {selectedCategory === category.value && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-gris-oscuro dark:bg-gray-900" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:shadow-sm rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800"
        >
          <X className="w-4 h-4" />
          <span>Limpiar todos los filtros</span>
        </button>
      )}
    </div>
  )
}

export default Catalog


