import React from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false
}) => {
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

  return (
    <img
      src={getOptimizedSrc()}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

export default OptimizedImage