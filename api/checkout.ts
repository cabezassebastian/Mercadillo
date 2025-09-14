import { VercelRequest, VercelResponse } from 
'@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items, total, direccion, metodo_pago, usuario_id } = req.body
    
    // Obtener el usuario_id del header o del body
    const userId = req.headers['x-user-id'] as string || usuario_id
    
    if (!userId) {
      console.error('No user ID provided')
      return res.status(400).json({ error: 'User ID is required' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('No items provided')
      return res.status(400).json({ error: 'Items are required' })
    }

    console.log('Creating order for user:', userId)
    console.log('Items:', items)
    console.log('Total:', total)

    // Crear el pedido en la base de datos
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([{
        usuario_id: userId,
        items,
        subtotal: parseFloat((total / 1.18).toFixed(2)),
        igv: parseFloat((total - (total / 1.18)).toFixed(2)),
        total,
        estado: 'pendiente',
        direccion_envio: direccion,
        metodo_pago: metodo_pago
      }])
      .select()
      .single()

    if (pedidoError) {
      console.error('Error creating order:', pedidoError)
      return res.status(500).json({ 
        error: 'Error creating order', 
        details: pedidoError.message 
      })
    }

    console.log('Order created successfully:', pedido.id)

    // Determinar la URL base para las redirecciones
    const appUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.PUBLIC_URL 
      || 'https://www.mercadillo.app'; // Usar tu dominio como fallback

    console.log('App URL for redirects:', appUrl)

    // Crear sesión de pago con Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'pen',
          product_data: {
            name: item.nombre,
            images: [item.imagen],
          },
          unit_amount: Math.round(item.precio * 100),
        },
        quantity: item.cantidad,
      })),
      mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/carrito`,
      metadata: {
        pedido_id: pedido.id,
        usuario_id: userId,
      },
    })

    console.log('Stripe session created:', session.id)
    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Error in checkout:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


