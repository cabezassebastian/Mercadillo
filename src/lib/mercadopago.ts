import { env } from '@/config/env'

// Configuración de Mercado Pago
export const mercadoPagoConfig = {
  publicKey: env.MERCADOPAGO_PUBLIC_KEY,
  locale: 'es-PE',
  currency: 'PEN',
}

// Crear preferencia de pago
export const createPaymentPreference = async (orderData: {
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
    picture_url?: string
  }>
  payer: {
    name: string
    email: string
    phone?: string
  }
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: 'approved' | 'all'
  notification_url?: string
}) => {
  try {
    const response = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error('Error al crear la preferencia de pago')
    }

    const preference = await response.json()
    return preference
  } catch (error) {
    console.error('Error creating payment preference:', error)
    throw error
  }
}

// Verificar estado del pago
export const checkPaymentStatus = async (paymentId: string) => {
  try {
    const response = await fetch(`/api/mercadopago/payment-status/${paymentId}`)
    
    if (!response.ok) {
      throw new Error('Error al verificar el estado del pago')
    }

    const paymentStatus = await response.json()
    return paymentStatus
  } catch (error) {
    console.error('Error checking payment status:', error)
    throw error
  }
}

// Mapear productos del carrito a items de Mercado Pago
export const mapCartToMercadoPagoItems = (cartItems: any[], baseUrl: string) => {
  return cartItems.map(item => ({
    id: item.id.toString(),
    title: item.nombre,
    quantity: item.cantidad,
    unit_price: parseFloat(item.precio),
    picture_url: item.imagen_url || `${baseUrl}/logo.webp`,
    category_id: item.categoria || 'general',
  }))
}

// Calcular totales
export const calculateTotals = (items: any[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const total = subtotal

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}