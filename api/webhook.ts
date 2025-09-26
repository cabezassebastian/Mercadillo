import { VercelRequest, VercelResponse } from '@vercel/node'
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

  const sig = req.headers['stripe-signature'] as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        // Actualizar el estado del pedido
        await supabase
          .from('pedidos')
          .update({ 
            estado: 'procesando',
            stripe_session_id: session.id,
            fecha_pago: new Date().toISOString()
          })
          .eq('id', session.metadata?.pedido_id)

        // Reducir stock de productos
        const pedido = await supabase
          .from('pedidos')
          .select('items')
          .eq('id', session.metadata?.pedido_id)
          .single()

        if (pedido.data) {
          for (const item of pedido.data.items) {
            // Obtener el stock actual
            const { data: producto } = await supabase
              .from('productos')
              .select('stock')
              .eq('id', item.producto_id)
              .single()

            if (producto && producto.stock >= item.cantidad) {
              // Actualizar el stock
              await supabase
                .from('productos')
                .update({ 
                  stock: producto.stock - item.cantidad
                })
                .eq('id', item.producto_id)
            }
          }
        }
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Actualizar pedido como pagado
        await supabase
          .from('pedidos')
          .update({ estado: 'procesando' })
          .eq('stripe_session_id', paymentIntent.metadata?.session_id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        
        // Actualizar pedido como fallido
        await supabase
          .from('pedidos')
          .update({ estado: 'cancelado' })
          .eq('stripe_session_id', failedPayment.metadata?.session_id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}


