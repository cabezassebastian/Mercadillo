export interface SearchFilters {
  query: string
  minPrice: number
  maxPrice: number
  minRating: number
  category: string
  hasShipping: boolean
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

export interface SearchResult {
  id: string
  nombre: string
  precio: number
  imagen_url: string
  categoria: string
  rating?: number
  stock: number
  tiene_envio: boolean
}

export interface AutocompleteSuggestion {
  text: string
  type: 'synonym' | 'popular' | 'category'
  icon?: string
}
