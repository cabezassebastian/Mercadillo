import { env } from '@/config/env'

const cloudName = env.CLOUDINARY_CLOUD_NAME

// URLs de las imágenes principales en Cloudinary
export const CLOUDINARY_IMAGES = {
  logo: 'mercadillo/logo_v1', // Sube tu logo.webp a Cloudinary con este public_id
  banner: 'mercadillo/banner_v1', // Sube tu banner.webp a Cloudinary con este public_id
  placeholder: 'mercadillo/placeholder_v1', // Imagen placeholder para productos
  favicon: 'mercadillo/favicon_v1' // Tu favicon en Cloudinary
}

// Función para generar URLs optimizadas
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    crop?: 'fill' | 'scale' | 'crop' | 'pad'
    gravity?: 'center' | 'face' | 'auto'
  } = {}
): string => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'center'
  } = options

  const transformations = []
  
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (crop) transformations.push(`c_${crop}`)
  if (gravity && crop === 'fill') transformations.push(`g_${gravity}`)
  
  transformations.push(`f_${format}`)
  transformations.push(`q_${quality}`)
  
  const transformString = transformations.join(',')
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`
}

// URLs específicas para diferentes usos
export const getLogoUrl = (size: 'small' | 'medium' | 'large' | 'navbar') => {
  const sizes = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 },
    navbar: { width: 56, height: 56 }
  }
  
  return getCloudinaryUrl(CLOUDINARY_IMAGES.logo, sizes[size])
}

export const getBannerUrl = (width: number, height?: number) => {
  return getCloudinaryUrl(CLOUDINARY_IMAGES.banner, {
    width,
    height,
    crop: 'fill',
    gravity: 'center'
  })
}

export const getProductImageUrl = (publicId: string, size: 'thumbnail' | 'card' | 'full') => {
  const sizes = {
    thumbnail: { width: 80, height: 80 },
    card: { width: 300, height: 300 },
    full: { width: 800, height: 800 }
  }
  
  return getCloudinaryUrl(publicId, sizes[size])
}