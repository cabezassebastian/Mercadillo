import React, { useState, useRef, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // Si es priority, cargar inmediatamente
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer para lazy loading (solo si no es priority)
  useEffect(() => {
    if (priority) return // Skip lazy loading para imágenes priority

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Comenzar a cargar 50px antes de que sea visible
      }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [priority])

  // Si es una URL de Cloudinary, la optimizamos
  const isCloudinaryUrl = src.includes('cloudinary.com')
  
  const getOptimizedSrc = () => {
    if (!isCloudinaryUrl) return src
    
    // Extraer public_id de la URL de Cloudinary
    const parts = src.split('/')
    const uploadIndex = parts.findIndex(part => part === 'upload')
    if (uploadIndex === -1) return src
    
    const publicId = parts.slice(uploadIndex + 1).join('/')
    const cloudName = parts[3] // Posición del cloud name en la URL
    
    // Construir URL optimizada
    const transformations = []
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    transformations.push('f_auto', 'q_auto', 'c_fill')
    
    const transformString = transformations.join(',')
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const defaultPlaceholder = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width || 300}" height="${height || 200}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
        Cargando...
      </text>
    </svg>
  `)}`

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: height ? `${height}px` : 'auto',
        minHeight: height ? `${height}px` : '200px'
      }}
    >
      {/* Placeholder mientras carga */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-opacity duration-300">
          <img
            src={placeholder || defaultPlaceholder}
            alt="Cargando..."
            className="w-full h-full object-cover opacity-50"
          />
        </div>
      )}

      {/* Imagen real */}
      {isInView && !hasError && (
        <img
          src={getOptimizedSrc()}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Fallback en caso de error */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Error al cargar imagen</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OptimizedImage