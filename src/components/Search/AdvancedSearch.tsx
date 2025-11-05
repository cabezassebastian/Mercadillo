import React, { useState, useEffect, useRef } from 'react'
import { Search, Mic, X, Sliders, Star, TrendingUp, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SearchFilters {
  query: string
  minPrice: number
  maxPrice: number
  minRating: number
  category: string
  hasShipping: boolean
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

interface AdvancedSearchProps {
  onSearch?: (filters: SearchFilters) => void
  placeholder?: string
}

// Diccionario de sinónimos en español
const synonyms: Record<string, string[]> = {
  'polo': ['camiseta', 'playera', 't-shirt', 'tshirt'],
  'camiseta': ['polo', 'playera', 't-shirt', 'remera'],
  'pantalón': ['jean', 'jeans', 'pantalones', 'pants'],
  'jean': ['pantalón', 'jeans', 'vaquero', 'denim'],
  'zapatillas': ['zapatos', 'tenis', 'sneakers', 'deportivos'],
  'zapatos': ['zapatillas', 'calzado', 'footwear'],
  'celular': ['móvil', 'teléfono', 'smartphone', 'phone'],
  'laptop': ['portátil', 'notebook', 'computadora', 'pc'],
  'ropa': ['vestimenta', 'indumentaria', 'prendas', 'clothes'],
  'vestido': ['dress', 'vestidos'],
  'blusa': ['camisa', 'top', 'shirt'],
  'short': ['shorts', 'bermuda', 'pantalón corto'],
  'falda': ['skirt', 'pollera'],
  'chompa': ['suéter', 'sweater', 'pullover', 'jersey'],
  'casaca': ['chaqueta', 'jacket', 'campera'],
  'billetera': ['cartera', 'wallet', 'monedero'],
  'mochila': ['backpack', 'morral', 'bolso'],
  'reloj': ['watch', 'cronómetro'],
  'gorra': ['cap', 'sombrero', 'hat'],
  'lentes': ['anteojos', 'gafas', 'glasses'],
  'audífonos': ['auriculares', 'headphones', 'earphones'],
}

// Corrección de typos comunes
const typoCorrections: Record<string, string> = {
  'plao': 'polo',
  'polera': 'polo',
  'pantalon': 'pantalón',
  'zapatilla': 'zapatillas',
  'selular': 'celular',
  'celulares': 'celular',
  'laptops': 'laptop',
  'ropas': 'ropa',
  'chompas': 'chompa',
  'casacas': 'casaca',
  'mochilas': 'mochila',
  'relojes': 'reloj',
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, placeholder = 'Buscar productos...' }) => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    category: '',
    hasShipping: false,
    sortBy: 'relevance'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const recognitionRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inicializar Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'es-PE'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        handleQueryChange(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  // Función para corregir typos y expandir sinónimos
  const expandQuery = (query: string): string[] => {
    const words = query.toLowerCase().split(' ')
    const expandedTerms: Set<string> = new Set()

    words.forEach(word => {
      // Agregar palabra original
      expandedTerms.add(word)

      // Corregir typos
      if (typoCorrections[word]) {
        expandedTerms.add(typoCorrections[word])
      }

      // Agregar sinónimos
      if (synonyms[word]) {
        synonyms[word].forEach(synonym => expandedTerms.add(synonym))
      }

      // Buscar si la palabra es sinónimo de otra
      Object.entries(synonyms).forEach(([key, values]) => {
        if (values.includes(word)) {
          expandedTerms.add(key)
          values.forEach(v => expandedTerms.add(v))
        }
      })
    })

    return Array.from(expandedTerms)
  }

  // Generar sugerencias de autocompletado
  const generateSuggestions = (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    const lowerQuery = query.toLowerCase()
    const allTerms = new Set<string>()

    // Buscar en sinónimos
    Object.keys(synonyms).forEach(key => {
      if (key.includes(lowerQuery)) {
        allTerms.add(key)
      }
      synonyms[key].forEach(synonym => {
        if (synonym.includes(lowerQuery)) {
          allTerms.add(synonym)
        }
      })
    })

    // Sugerencias populares
    const popularSearches = [
      'polo blanco',
      'zapatillas deportivas',
      'jean azul',
      'casaca negra',
      'mochila escolar',
      'reloj digital',
      'audífonos bluetooth',
      'vestido rojo',
      'pantalón negro',
      'chompa de lana'
    ]

    popularSearches.forEach(search => {
      if (search.toLowerCase().includes(lowerQuery)) {
        allTerms.add(search)
      }
    })

    setSuggestions(Array.from(allTerms).slice(0, 5))
  }

  const handleQueryChange = (value: string) => {
    setFilters(prev => ({ ...prev, query: value }))
    generateSuggestions(value)
    setShowSuggestions(true)
  }

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta búsqueda por voz')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSearch = () => {
    setShowSuggestions(false)
    
    if (onSearch) {
      onSearch(filters)
    } else {
      // Navegar a página de resultados con query params
      const params = new URLSearchParams()
      
      if (filters.query) {
        const expandedTerms = expandQuery(filters.query)
        params.append('q', expandedTerms.join('|'))
      }
      if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice < 1000) params.append('maxPrice', filters.maxPrice.toString())
      if (filters.minRating > 0) params.append('minRating', filters.minRating.toString())
      if (filters.category) params.append('category', filters.category)
      if (filters.hasShipping) params.append('shipping', 'true')
      params.append('sort', filters.sortBy)

      navigate(`/productos?${params.toString()}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      category: '',
      hasShipping: false,
      sortBy: 'relevance'
    })
  }

  return (
    <div className="relative w-full">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 ml-4" />
          
          <input
            ref={inputRef}
            type="text"
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-700 dark:text-gray-200"
          />

          {filters.query && (
            <button
              onClick={() => handleQueryChange('')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          <button
            onClick={handleVoiceSearch}
            className={`p-2 mr-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Búsqueda por voz"
          >
            <Mic className={`w-5 h-5 ${isListening ? 'text-red-600' : 'text-gray-400'}`} />
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 mr-2 rounded-full transition-colors ${
              showFilters ? 'bg-amarillo dark:bg-yellow-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Filtros avanzados"
          >
            <Sliders className={`w-5 h-5 ${showFilters ? 'text-white' : 'text-gray-400'}`} />
          </button>

          <button
            onClick={handleSearch}
            className="bg-amarillo hover:bg-orange-500 text-white px-6 py-3 rounded-r-lg font-semibold transition-colors"
          >
            Buscar
          </button>
        </div>

        {/* Sugerencias de autocompletado */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  handleQueryChange(suggestion)
                  setShowSuggestions(false)
                  inputRef.current?.focus()
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filtros Avanzados
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-amarillo hover:text-orange-500 font-medium"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rango de precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de Precio
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Min:</span>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-16">
                    S/ {filters.minPrice}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Max:</span>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-16">
                    S/ {filters.maxPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Valoración mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valoración Mínima
              </label>
              <div className="flex space-x-2">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                      filters.minRating === rating
                        ? 'border-amarillo bg-amarillo/10 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-amarillo/50'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${filters.minRating === rating ? 'text-amarillo fill-current' : 'text-gray-400'}`} />
                    {rating > 0 && <span className="text-sm font-medium">{rating}+</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-amarillo focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                <option value="Ropa">Ropa</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Hogar">Hogar</option>
                <option value="Deportes">Deportes</option>
                <option value="Juguetes">Juguetes</option>
                <option value="Libros">Libros</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Electrónica">Electrónica</option>
              </select>
            </div>

            {/* Disponibilidad de envío */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasShipping"
                checked={filters.hasShipping}
                onChange={(e) => setFilters(prev => ({ ...prev, hasShipping: e.target.checked }))}
                className="w-4 h-4 text-amarillo focus:ring-amarillo border-gray-300 rounded"
              />
              <label htmlFor="hasShipping" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Solo con envío disponible
              </label>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-amarillo focus:border-transparent"
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Valorados</option>
                <option value="newest">Más Recientes</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar sugerencias */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}

export default AdvancedSearch
