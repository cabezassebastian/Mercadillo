import React, { useState } from 'react'
import { Star, TrendingUp, Clock, ChevronDown, Filter, X } from 'lucide-react'

interface ReviewFiltersProps {
  selectedRating: number | null
  sortBy: 'recent' | 'helpful' | 'rating-high' | 'rating-low'
  onRatingChange: (rating: number | null) => void
  onSortChange: (sort: 'recent' | 'helpful' | 'rating-high' | 'rating-low') => void
  ratingCounts: { 5: number; 4: number; 3: number; 2: number; 1: number }
  totalReviews: number
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  selectedRating,
  sortBy,
  onRatingChange,
  onSortChange,
  ratingCounts,
  totalReviews,
}) => {
  const [showRatingFilter, setShowRatingFilter] = useState(false)
  const [showSortFilter, setShowSortFilter] = useState(false)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  const getSortLabel = () => {
    switch (sortBy) {
      case 'recent':
        return 'Más Recientes'
      case 'helpful':
        return 'Más Útiles'
      case 'rating-high':
        return 'Mayor Calificación'
      case 'rating-low':
        return 'Menor Calificación'
    }
  }

  const getRatingLabel = () => {
    if (selectedRating === null) return 'Todas las calificaciones'
    const labels = {
      5: 'Excelente (5★)',
      4: 'Muy bueno (4★)',
      3: 'Bueno (3★)',
      2: 'Regular (2★)',
      1: 'Malo (1★)'
    }
    return labels[selectedRating as keyof typeof labels]
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Filtros y Ordenamiento
          </h3>
        </div>
        {selectedRating !== null && (
          <button
            onClick={() => onRatingChange(null)}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Filtro por Calificación */}
        <div className="relative">
          <button
            onClick={() => setShowRatingFilter(!showRatingFilter)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getRatingLabel()}
              </span>
              {selectedRating !== null && (
                <span className="ml-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                  {ratingCounts[selectedRating as keyof typeof ratingCounts]}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                showRatingFilter ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown de Calificación con animación */}
          <div
            className={`absolute z-10 mt-2 w-full transition-all duration-300
              ${showRatingFilter ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}
              bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden`}
            style={{ willChange: 'opacity, transform' }}
          >
              <button
                onClick={() => {
                  onRatingChange(null)
                  setShowRatingFilter(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-200 ${
                  selectedRating === null
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <span className="text-sm font-medium">Todas las calificaciones</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                  {totalReviews}
                </span>
              </button>

              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    onRatingChange(rating)
                    setShowRatingFilter(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-200 ${
                    selectedRating === rating
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {renderStars(rating)}
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {rating === 5 && 'Excelente'}
                      {rating === 4 && 'Muy bueno'}
                      {rating === 3 && 'Bueno'}
                      {rating === 2 && 'Regular'}
                      {rating === 1 && 'Malo'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                    {ratingCounts[rating as keyof typeof ratingCounts]}
                  </span>
                </button>
              ))}
            </div>
          {/* Fin animación dropdown calificación */}
        </div>

        {/* Ordenamiento */}
        <div className="relative">
          <button
            onClick={() => setShowSortFilter(!showSortFilter)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getSortLabel()}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                showSortFilter ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown de Ordenamiento con animación */}
          <div
            className={`absolute z-10 mt-2 w-full transition-all duration-300
              ${showSortFilter ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}
              bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden`}
            style={{ willChange: 'opacity, transform' }}
          >
              <button
                onClick={() => {
                  onSortChange('recent')
                  setShowSortFilter(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors duration-200 ${
                  sortBy === 'recent'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Más Recientes</span>
              </button>

              <button
                onClick={() => {
                  onSortChange('helpful')
                  setShowSortFilter(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors duration-200 ${
                  sortBy === 'helpful'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Más Útiles</span>
              </button>

              <button
                onClick={() => {
                  onSortChange('rating-high')
                  setShowSortFilter(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors duration-200 ${
                  sortBy === 'rating-high'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Mayor Calificación</span>
              </button>

              <button
                onClick={() => {
                  onSortChange('rating-low')
                  setShowSortFilter(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors duration-200 ${
                  sortBy === 'rating-low'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Menor Calificación</span>
              </button>
            </div>
          {/* Fin animación dropdown ordenamiento */}
        </div>
      </div>
    </div>
  )
}

export default ReviewFilters
