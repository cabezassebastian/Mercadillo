import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import OptimizedImage from '../common/OptimizedImage'

interface LogoProps {
  className?: string
  size?: 'small' | 'medium' | 'large' | 'navbar'
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium' }) => {
  const [imageError] = useState(false)

  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16',
    navbar: 'h-14'
  }

  const fallbackSizeClasses = {
    small: 'h-8 text-lg px-2',
    medium: 'h-12 text-xl px-3',
    large: 'h-16 text-2xl px-4',
    navbar: 'h-14 text-xl px-3'
  }

  return (
    <Link to="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        {!imageError ? (
          <OptimizedImage
            src="https://res.cloudinary.com/ddbihpqr1/image/upload/f_auto,q_auto/mercadillo/logo_v1"
            alt="Mercadillo Lima Perú Logo"
            className={`${sizeClasses[size]} w-auto object-contain transition-transform duration-200 hover:scale-105 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm`}
            priority={true}
          />
        ) : (
          <div className={`${fallbackSizeClasses[size]} flex items-center justify-center bg-amarillo dark:bg-yellow-500 rounded-lg text-gris-oscuro dark:text-gray-900 font-bold transition-transform duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600 shadow-sm`}>
            Mercadillo
          </div>
        )}
      </div>
    </Link>
  )
}

export default Logo