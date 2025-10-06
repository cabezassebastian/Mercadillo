import React from 'react'
import { Star, TrendingUp, Clock } from 'lucide-react'

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
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filtro por calificación */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Filtrar por Calificación</span>
          </h3>
          <div className="space-y-2">
            {/* Todas las calificaciones */}
            <button
              onClick={() => onRatingChange(null)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                selectedRating === null
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Todas las calificaciones
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                {totalReviews}
              </span>
            </button>

            {/* Filtros por estrella */}
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => onRatingChange(rating)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  selectedRating === rating
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {renderStars(rating)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {rating === 5 && 'Excelente'}
                    {rating === 4 && 'Muy bueno'}
                    {rating === 3 && 'Bueno'}
                    {rating === 2 && 'Regular'}
                    {rating === 1 && 'Malo'}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {ratingCounts[rating as keyof typeof ratingCounts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ordenamiento */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span>Ordenar por</span>
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onSortChange('recent')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                sortBy === 'recent'
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Más Recientes
                </span>
              </div>
            </button>

            <button
              onClick={() => onSortChange('helpful')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                sortBy === 'helpful'
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Más Útiles
                </span>
              </div>
            </button>

            <button
              onClick={() => onSortChange('rating-high')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                sortBy === 'rating-high'
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Calificación: Mayor a Menor
                </span>
              </div>
            </button>

            <button
              onClick={() => onSortChange('rating-low')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                sortBy === 'rating-low'
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Calificación: Menor a Mayor
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {selectedRating !== null && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Mostrando reseñas con</span>
              <div className="flex items-center space-x-1 font-semibold text-yellow-600 dark:text-yellow-400">
                {renderStars(selectedRating)}
              </div>
            </div>
            <button
              onClick={() => onRatingChange(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Limpiar filtro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewFilters
