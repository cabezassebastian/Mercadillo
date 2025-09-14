import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Grid, List } from 'lucide-react'
import { supabase, Producto } from '@/lib/supabase'
import ProductCard from '@/components/Product/ProductCard'

const Catalog: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Nuevo estado para manejar errores
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('nombre')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchParams, setSearchParams] = useSearchParams()

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
          console.warn('Error inicial al obtener productos en catálogo (posible columna created_at faltante): ', supabaseError.message)
          // Si falla la ordenación por created_at, intentar sin ordenación
          console.log('Intentando obtener productos en catálogo sin ordenación por created_at...')
          const { data: fallbackData, error: fallbackError } = await productsQuery

          if (fallbackError) {
            console.error('Error fetching products in catalog (fallback): ', fallbackError)
            setError('No se pudo cargar la información del catálogo, inténtalo más tarde')
            setProductos([]) // Asegura que los productos estén vacíos en caso de error
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

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'precio-asc':
          return a.precio - b.precio
        case 'precio-desc':
          return b.precio - a.precio
        case 'nombre':
          return a.nombre.localeCompare(b.nombre)
        case 'stock':
          return b.stock - a.stock
        default:
          return 0
      }
    })

    setFilteredProductos(filtered)
  }, [productos, searchTerm, selectedCategory, sortBy])

  const categories = Array.from(new Set(productos.map(p => p.categoria)))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amarillo"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hueso py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro mb-4">
            Catálogo de Productos
          </h1>
          <p className="text-lg text-gray-600">
            Encuentra los mejores productos de Lima, Perú
          </p>
        </div>

        {/* Display error message if there is one */}
        {error && (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-rojo-claro rounded-lg shadow-md max-w-md mx-auto my-4">
            <p className="text-xl font-semibold text-rojo-oscuro mb-4">⚠️ Error al cargar el catálogo</p>
            <p className="text-gray-700">{error}</p>
            <p className="text-sm text-gray-500 mt-2">Por favor, verifica tu conexión a internet o inténtalo de nuevo más tarde.</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-blanco rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  // Actualizar URL cuando se cambia el término de búsqueda
                  if (e.target.value.trim()) {
                    setSearchParams({ search: e.target.value.trim() })
                  } else {
                    setSearchParams({})
                  }
                }}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="nombre">Ordenar por nombre</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="stock">Stock disponible</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-amarillo text-gris-oscuro' : 'bg-gray-200 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-amarillo text-gris-oscuro' : 'bg-gray-200 text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Mostrando {filteredProductos.length} de {productos.length} productos
          </p>
        </div>

        {/* Products Grid */}
        {filteredProductos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gris-oscuro mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProductos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalog


