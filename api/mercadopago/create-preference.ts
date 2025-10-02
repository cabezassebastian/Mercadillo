import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

// Tipos e interfaces
interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

// Funciones auxiliares
function generateExternalReference(): string {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function calculateOrderTotals(items: CartItem[]): {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Configurar cliente de Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Usamos service role para insertar datos
    )

    // Configurar cliente de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    })

    const preference = new Preference(client)

    // Extraer datos del cuerpo de la petición
    const { 
      items, 
      payer, 
      back_urls, 
      auto_return, 
      notification_url,
      shipping_address, // Nueva: dirección de envío
      user_id // Nueva: ID del usuario
    } = req.body

    // Validar datos requeridos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items son requeridos' })
    }

    if (!payer || !payer.email) {
      return res.status(400).json({ error: 'Información del pagador es requerida' })
    }

    if (!user_id) {
      return res.status(400).json({ error: 'ID de usuario es requerido' })
    }

    if (!shipping_address) {
      return res.status(400).json({ error: 'Dirección de envío es requerida' })
    }

    // Generar referencia externa única con los datos del pedido
    const externalReference = generateExternalReference()

    // Calcular totales
    const cartItems: CartItem[] = items.map(item => ({
      id: item.id,
      title: item.title,
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
      image: item.picture_url || ''
    }))

    const { subtotal, igv, total } = calculateOrderTotals(cartItems)

    // Guardar datos del pedido en el external_reference para crear el pedido después del pago
    const orderData = {
      user_id,
      items: cartItems,
      subtotal,
      igv,
      total,
      shipping_address,
      external_reference: externalReference
    }

    // Codificar los datos como base64 para incluirlos en external_reference
    const encodedOrderData = Buffer.from(JSON.stringify(orderData)).toString('base64')
    const fullExternalReference = `${externalReference}|${encodedOrderData}`

    // Crear la preferencia de pago SIN crear el pedido todavía
    const preferenceData = {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: 'PEN',
        picture_url: item.picture_url
      })),
      payer: {
        name: payer.name,
        email: payer.email,
        phone: payer.phone ? {
          area_code: '51',
          number: payer.phone
        } : undefined
      },
      back_urls: {
        success: back_urls?.success || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success`,
        failure: back_urls?.failure || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/failure`,
        pending: back_urls?.pending || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/pending`
      },
      auto_return: auto_return || 'approved',
      notification_url: notification_url || `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'}/api/mercadopago/webhook`,
      statement_descriptor: 'MERCADILLO',
      external_reference: fullExternalReference,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12
      }
    }

    // Crear la preferencia en MercadoPago
    const result = await preference.create({ body: preferenceData })

    if (!result.id) {
      throw new Error('No se pudo crear la preferencia de pago')
    }

    // Retornar la preferencia creada
    res.status(200).json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      preference_id: result.id,
      external_reference: externalReference
    })

  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error)
    
    // Enviar error detallado para debugging
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}