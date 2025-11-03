import { env } from '@/config/env'
import { API_ENDPOINTS } from '@/config/api'

// Configuración de Mercado Pago
export const mercadoPagoConfig = {
  publicKey: env.MERCADOPAGO_PUBLIC_KEY,
  locale: 'es-PE',
  currency: 'PEN',
}

// Crear preferencia de pago
export const createPaymentPreference = async (orderData: any) => {
  try {
    const response = await fetch(API_ENDPOINTS.mercadopago.createPreference, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
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
    picture_url: item.imagen || item.imagen_url || `${baseUrl}/logo.webp`,
    category_id: item.categoria || 'general',
    variant_id: item.variant_id || null,
    variant_label: item.variant_label || null,
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