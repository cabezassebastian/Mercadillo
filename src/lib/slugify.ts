/**
 * Utility functions for generating URL-friendly slugs from product names
 */

/**
 * Converts a string to a URL-friendly slug
 * Examples:
 * - "Hola Mundo" -> "hola-mundo"
 * - "Smartphone A20 128GB" -> "smartphone-a20-128gb"
 * - "Sofá 3 Plazas" -> "sofa-3-plazas"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Reemplazar acentos y caracteres especiales
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplazar espacios y caracteres no permitidos con guiones
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generates a product URL using the product's slug from database
 * Format: /producto/slug
 * Example: /producto/pelado-nuevo
 * 
 * If slug is not provided, falls back to old format with ID
 */
export function getProductUrl(idOrSlug: string, nombre?: string): string {
  // Si ya es un slug (no contiene guiones de UUID), usarlo directamente
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  
  if (!uuidRegex.test(idOrSlug)) {
    // Es un slug, usarlo directamente
    return `/producto/${idOrSlug}`
  }
  
  // Es un ID, generar slug temporal (para retrocompatibilidad)
  if (nombre) {
    const slug = slugify(nombre)
    return `/producto/${slug}-${idOrSlug.substring(0, 8)}`
  }
  
  // Fallback: solo ID
  return `/producto/${idOrSlug}`
}

/**
 * Extracts the product ID or slug from URL parameter
 * Supports multiple formats:
 * - "pelado-nuevo" (new slug format) -> returns "pelado-nuevo"
 * - "pelado-nuevo-abc123" (old format with UUID) -> returns UUID
 * - "abc-123-def-456..." (UUID only) -> returns UUID
 */
export function extractProductIdOrSlug(slugWithId: string): string {
  // Si es un UUID completo, retornarlo
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(slugWithId)) {
    return slugWithId
  }

  // Si NO contiene ningún UUID, es un slug puro (nuevo formato)
  if (!slugWithId.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)) {
    return slugWithId
  }

  // Intentar extraer UUID del formato antiguo (slug-uuid)
  const parts = slugWithId.split('-')
  
  // Reconstruir posibles UUIDs desde el final
  for (let i = parts.length - 1; i >= 4; i--) {
    const possibleUuid = parts.slice(i - 4, i + 1).join('-')
    if (uuidRegex.test(possibleUuid)) {
      return possibleUuid
    }
  }

  // Si no se encuentra UUID, retornar el valor original
  // (podría ser un slug)
  return slugWithId
}

/**
 * Generates a full product URL for external sharing
 */
export function getFullProductUrl(idOrSlug: string, nombre?: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://www.mercadillo.app'
  return `${baseUrl}${getProductUrl(idOrSlug, nombre)}`
}

// Alias for backward compatibility
export const extractProductId = extractProductIdOrSlug
