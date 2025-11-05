import React, { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, Clock, Mic } from 'lucide-react'
import { Producto } from '@/lib/supabase'

interface SearchWithSuggestionsProps {
  value: string
  onChange: (value: string) => void
  onSearch: (term: string) => void
  productos: Producto[]
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
}

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  value,
  onChange,
  onSearch,
  productos,
  placeholder = "¿Qué estás buscando hoy?"
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isListening, setIsListening] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Popular searches (could be dynamic from backend)
  const popularSearches = [
    'smartphone', 'laptop', 'camiseta', 'zapatillas', 
    'sofá', 'mesa', 'pelota', 'raqueta'
  ]

  // Inicializar Web Speech API
  useEffect(() => {
    // Verificar soporte en diferentes navegadores incluyendo Opera
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 
                                  'SpeechRecognition' in window ||
                                  ('webkitSpeechRecognition' in (window as any))
    
    if (hasSpeechRecognition) {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                                 (window as any).webkitSpeechRecognition
      
      try {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'es-PE'

        recognitionRef.current.onstart = () => {
          console.log('Reconocimiento de voz iniciado')
          setIsListening(true)
        }

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          console.log('Texto reconocido:', transcript)
          onChange(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Error en reconocimiento de voz:', event.error)
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            alert('Permiso de micrófono denegado. Por favor permite el acceso al micrófono en la configuración de tu navegador.')
          } else if (event.error === 'no-speech') {
            console.log('No se detectó voz')
          } else if (event.error === 'network') {
            alert('Error de red. Verifica tu conexión a internet.')
          } else {
            console.log('Error:', event.error)
          }
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          console.log('Reconocimiento de voz finalizado')
          setIsListening(false)
        }
      } catch (error) {
        console.error('Error al inicializar reconocimiento de voz:', error)
      }
    } else {
      console.warn('El navegador no soporta reconocimiento de voz')
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('Error al detener reconocimiento:', e)
        }
      }
    }
  }, [onChange])

  // Función para expandir búsqueda con sinónimos
  const expandSearchWithSynonyms = (term: string): string[] => {
    const lowerTerm = term.toLowerCase().trim()
    const expanded = [lowerTerm]
    
    // Buscar sinónimos
    for (const [key, syns] of Object.entries(synonyms)) {
      if (lowerTerm.includes(key)) {
        expanded.push(...syns)
      }
      if (syns.some(syn => lowerTerm.includes(syn))) {
        expanded.push(key, ...syns)
      }
    }
    
    return [...new Set(expanded)]
  }

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentSearches')
    if (recent) {
      setRecentSearches(JSON.parse(recent))
    }
  }, [])

  // Generate suggestions based on input
  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([])
      return
    }

    // Expandir búsqueda con sinónimos
    const expandedTerms = expandSearchWithSynonyms(value)

    const productSuggestions = productos
      .filter(producto => {
        const nombreLower = producto.nombre.toLowerCase()
        const descripcionLower = producto.descripcion.toLowerCase()
        const categoriaLower = producto.categoria.toLowerCase()
        
        // Buscar coincidencias con el término original y sus sinónimos
        return expandedTerms.some(term =>
          nombreLower.includes(term) ||
          descripcionLower.includes(term) ||
          categoriaLower.includes(term)
        )
      })
      .slice(0, 5)
      .map(producto => producto.nombre)

    const categorySuggestions = Array.from(new Set(
      productos
        .filter(producto => 
          expandedTerms.some(term =>
            producto.categoria.toLowerCase().includes(term)
          )
        )
        .map(producto => producto.categoria)
    )).slice(0, 3)

    const allSuggestions = [
      ...new Set([...productSuggestions, ...categorySuggestions])
    ].slice(0, 6)

    setSuggestions(allSuggestions)
  }, [value, productos])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Save search to recent searches
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return
    
    const updatedRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updatedRecent)
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))
  }

  const handleSearch = (term: string) => {
    onChange(term)
    onSearch(term)
    saveRecentSearch(term)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const totalItems = suggestions.length + recentSearches.length + popularSearches.length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => (prev < totalItems - 1 ? prev + 1 : -1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > -1 ? prev - 1 : totalItems - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex === -1) {
          handleSearch(value)
        } else {
          let selectedItem = ''
          if (highlightedIndex < suggestions.length) {
            selectedItem = suggestions[highlightedIndex]
          } else if (highlightedIndex < suggestions.length + recentSearches.length) {
            selectedItem = recentSearches[highlightedIndex - suggestions.length]
          } else {
            selectedItem = popularSearches[highlightedIndex - suggestions.length - recentSearches.length]
          }
          handleSearch(selectedItem)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      const isOpera = (navigator.userAgent.indexOf('OPR') !== -1) || (navigator.userAgent.indexOf('Opera') !== -1)
      if (isOpera) {
        alert('Búsqueda por voz no disponible en Opera. Por favor usa Chrome, Edge o Safari, o habilita los permisos de micrófono en opera://settings/privacy.')
      } else {
        alert('Tu navegador no soporta búsqueda por voz. Por favor usa Chrome, Edge o Safari.')
      }
      return
    }

    if (isListening) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (error) {
        console.error('Error al detener el reconocimiento de voz:', error)
        setIsListening(false)
      }
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error al iniciar el reconocimiento de voz:', error)
        const isOpera = (navigator.userAgent.indexOf('OPR') !== -1) || (navigator.userAgent.indexOf('Opera') !== -1)
        if (isOpera) {
          alert('No se pudo iniciar la búsqueda por voz en Opera. Verifica los permisos del micrófono en opera://settings/privacy o usa Chrome/Edge.')
        } else {
          alert('No se pudo iniciar la búsqueda por voz. Asegúrate de permitir el acceso al micrófono.')
        }
        setIsListening(false)
      }
    }
  }

  return (
    <div className="relative flex-1" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amarillo dark:focus:ring-yellow-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg transition-all duration-200"
        />
        
        {/* Botón de búsqueda por voz */}
        <button
          onClick={handleVoiceSearch}
          className={`absolute right-12 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
            isListening 
              ? 'text-red-500 animate-pulse' 
              : 'text-gray-400 hover:text-amarillo dark:hover:text-yellow-500'
          }`}
          title="Búsqueda por voz"
        >
          <Mic className="w-5 h-5" />
        </button>

        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          
          {/* Suggestions from search */}
          {suggestions.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Sugerencias
              </h4>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(suggestion)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    index === highlightedIndex ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Búsquedas Recientes
                </h4>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  Limpiar
                </button>
              </div>
              {recentSearches.map((recent, index) => {
                const adjustedIndex = suggestions.length + index
                return (
                  <button
                    key={recent}
                    onClick={() => handleSearch(recent)}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                      adjustedIndex === highlightedIndex ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{recent}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Popular Searches */}
          {(!value || value.length < 2) && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Búsquedas Populares
              </h4>
              {popularSearches.map((popular, index) => {
                const adjustedIndex = suggestions.length + recentSearches.length + index
                return (
                  <button
                    key={popular}
                    onClick={() => handleSearch(popular)}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                      adjustedIndex === highlightedIndex ? 'bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{popular}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* No suggestions message */}
          {value.length >= 2 && suggestions.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No encontramos sugerencias para "{value}"</p>
              <p className="text-sm mt-1">Presiona Enter para buscar de todos modos</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchWithSuggestions