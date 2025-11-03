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
 * Generates a product URL with slug
 * Format: /producto/slug-id
 * Example: /producto/smartphone-a20-128gb-abc123
 */
export function getProductUrl(id: string, nombre: string): string {
  const slug = slugify(nombre)
  return `/producto/${slug}-${id}`
}

/**
 * Extracts the product ID from a slug-based URL
 * Supports both formats:
 * - /producto/abc-123 (old format)
 * - /producto/smartphone-a20-128gb-abc123 (new format with slug)
 */
export function extractProductId(slugWithId: string): string {
  // Si el parámetro ya es un UUID válido, retornarlo directamente
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(slugWithId)) {
    return slugWithId
  }

  // Intentar extraer UUID del formato slug-uuid
  // Buscar el último segmento que sea un UUID
  const parts = slugWithId.split('-')
  
  // Reconstruir posibles UUIDs desde el final
  for (let i = parts.length - 1; i >= 4; i--) {
    const possibleUuid = parts.slice(i - 4, i + 1).join('-')
    if (uuidRegex.test(possibleUuid)) {
      return possibleUuid
    }
  }

  // Si no se encuentra UUID, retornar el valor original
  // (para compatibilidad con IDs antiguos)
  return slugWithId
}

/**
 * Generates a full product URL for external sharing
 */
export function getFullProductUrl(id: string, nombre: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://www.mercadillo.app'
  return `${baseUrl}${getProductUrl(id, nombre)}`
}
