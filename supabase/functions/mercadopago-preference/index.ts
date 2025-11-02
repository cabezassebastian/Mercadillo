import { serve } from "https://deno.land/std@0.201.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { 
      items, 
      payer, 
      back_urls, 
      notification_url,
      shipping_address,
      user_id,
      descuento = 0,
      cupon_codigo = null,
      delivery_data = null,
      metadata = {}
    } = body

    // Validar datos requeridos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Items son requeridos' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!payer || !payer.email) {
      return new Response(
        JSON.stringify({ error: 'Información del pagador es requerida' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'ID de usuario es requerido' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generar referencia externa única
    const externalReference = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Calcular totales
    const cartItems: CartItem[] = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
      image: item.picture_url || ''
    }))

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = Math.max(0, subtotal - descuento)

    // Guardar datos del pedido
    const orderData = {
      user_id,
      items: cartItems,
      subtotal: Math.round(subtotal * 100) / 100,
      descuento: Math.round(descuento * 100) / 100,
      cupon_codigo,
      total: Math.round(total * 100) / 100,
      shipping_address: shipping_address || 'Lima, Perú',
      external_reference: externalReference,
      delivery_data: delivery_data ? {
        metodo_entrega: delivery_data.metodo_entrega || 'envio',
        nombre_completo: delivery_data.nombre_completo || '',
        dni: delivery_data.dni || null,
        telefono: delivery_data.telefono || '',
        direccion: delivery_data.direccion || shipping_address || 'Lima, Perú'
      } : null,
      metadata
    }

    // Codificar datos como base64
    const encodedOrderData = btoa(JSON.stringify(orderData))
    const fullExternalReference = `${externalReference}|${encodedOrderData}`

    // Aplicar descuento proporcionalmente
    const discountFactor = descuento > 0 ? (subtotal - descuento) / subtotal : 1

    // Obtener URL base para webhooks y redirects
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://mercadillo.app'
    const FUNCTIONS_URL = Deno.env.get('SUPABASE_URL') + '/functions/v1'

    // Crear preferencia de pago
    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: descuento > 0 
          ? Math.round(Number(item.unit_price) * discountFactor * 100) / 100
          : Number(item.unit_price),
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
        success: back_urls?.success || `${FRONTEND_URL}/checkout/success`,
        failure: back_urls?.failure || `${FRONTEND_URL}/checkout/failure`,
        pending: back_urls?.pending || `${FRONTEND_URL}/checkout/pending`
      },
      auto_return: 'all',
      notification_url: notification_url || `${FUNCTIONS_URL}/mercadopago-webhook`,
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

    // Llamar a la API de MercadoPago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    })

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json()
      console.error('MercadoPago API error:', errorData)
      throw new Error(`MercadoPago API error: ${mpResponse.status}`)
    }

    const result = await mpResponse.json()

    return new Response(
      JSON.stringify({
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        preference_id: result.id,
        external_reference: externalReference
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
