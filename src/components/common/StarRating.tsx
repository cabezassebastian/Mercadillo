import React, { useState } from 'react'
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
  const [hoveredRating, setHoveredRating] = useState<number>(0)

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

  const handleStarHover = (starIndex: number) => {
    if (!readonly) {
      setHoveredRating(starIndex)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0)
    }
  }

  // Usar el rating hover si está disponible, sino usar el rating normal
  const displayRating = hoveredRating > 0 ? hoveredRating : rating

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= displayRating
          const isHovered = hoveredRating > 0 && starIndex <= hoveredRating
          
          return (
            <button
              key={starIndex}
              type="button"
              disabled={readonly}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              className={`
                ${sizeClasses[size]}
                ${readonly 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-110 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 rounded'
                }
                ${isFilled 
                  ? isHovered 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-yellow-400 fill-current'
                  : isHovered
                    ? 'text-yellow-300 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }
                ${!readonly && isHovered ? 'transform scale-110' : ''}
              `}
              aria-label={`${starIndex} estrella${starIndex > 1 ? 's' : ''}`}
            >
              <Star 
                className={`
                  w-full h-full transition-all duration-150
                  ${isFilled || (isHovered && starIndex <= hoveredRating) ? 'fill-current' : ''}
                `}
              />
            </button>
          )
        })}
      </div>
      
      {showText && (
        <span className={`ml-2 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}>
          {displayRating > 0 ? (
            <>
              {displayRating.toFixed(1)} de 5 estrella{displayRating !== 1 ? 's' : ''}
            </>
          ) : (
            'Sin calificaciones'
          )}
        </span>
      )}
      
      {/* Texto de hover para modo interactivo */}
      {!readonly && hoveredRating > 0 && (
        <span className={`ml-2 text-yellow-600 dark:text-yellow-400 font-medium ${textSizeClasses[size]}`}>
          {hoveredRating} estrella{hoveredRating > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

export default StarRating