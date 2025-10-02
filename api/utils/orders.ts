// Utilidades compartidas para las APIs de MercadoPago

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

/**
 * Generar external_reference único para MercadoPago
 */
export function generateExternalReference(): string {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calcular totales del pedido (incluye IGV)
 */
export function calculateOrderTotals(items: CartItem[]): {
  subtotal: number
  igv: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const igv = subtotal * 0.18 // IGV 18% en Perú
  const total = subtotal + igv

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    igv: Math.round(igv * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}
