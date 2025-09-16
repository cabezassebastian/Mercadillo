import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium' }) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16'
  }

  const fallbackSizeClasses = {
    small: 'h-8 text-lg px-2',
    medium: 'h-12 text-xl px-3',
    large: 'h-16 text-2xl px-4'
  }

  return (
    <Link to="/" className={`flex items-center space-x-2 relative group ${className}`}>
      <div className="relative overflow-hidden rounded-lg shadow-sm">
        {!imageError ? (
          <img 
            src="/logo.png" 
            alt="Mercadillo Lima Perú Logo" 
            className={`${sizeClasses[size]} w-auto object-contain transition-all duration-300 hover:scale-105`}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className={`${fallbackSizeClasses[size]} flex items-center justify-center bg-amarillo dark:bg-yellow-500 rounded-lg text-gris-oscuro dark:text-gray-900 font-bold transition-all duration-300 hover:scale-105`}>
            Mercadillo
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 dark:from-black/40 dark:to-black/10 dark:opacity-10 dark:group-hover:opacity-50 transition-all duration-300 rounded-lg"></div>
      </div>
    </Link>
  )
}

export default Logo