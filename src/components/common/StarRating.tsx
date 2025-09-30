import React from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showText = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const handleStarClick = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= rating
          const isHalfFilled = starIndex === Math.ceil(rating) && rating % 1 !== 0
          
          return (
            <button
              key={starIndex}
              type="button"
              disabled={readonly}
              onClick={() => handleStarClick(starIndex)}
              className={`
                ${sizeClasses[size]}
                ${readonly 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-110 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 rounded'
                }
                ${isFilled 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 dark:text-gray-600'
                }
              `}
              aria-label={`${starIndex} estrella${starIndex > 1 ? 's' : ''}`}
            >
              <Star 
                className={`
                  w-full h-full
                  ${isFilled ? 'fill-current' : ''}
                  ${isHalfFilled ? 'fill-current opacity-50' : ''}
                `}
              />
            </button>
          )
        })}
      </div>
      
      {showText && (
        <span className={`ml-2 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}>
          {rating > 0 ? (
            <>
              {rating.toFixed(1)} de 5 estrella{rating !== 1 ? 's' : ''}
            </>
          ) : (
            'Sin calificaciones'
          )}
        </span>
      )}
    </div>
  )
}

export default StarRating