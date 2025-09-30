import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, data } = req.body

    console.log('Mercado Pago webhook received:', { type, data })

    // Verificar que es una notificación de pago
    if (type === 'payment') {
      const paymentId = data.id
      
      console.log('Payment notification:', {
        paymentId,
        action: data.action
      })

      // Aquí puedes obtener más información del pago y actualizar tu base de datos
      // Para esto necesitarías tu access token de Mercado Pago
      
      if (data.action === 'payment.created' || data.action === 'payment.updated') {
        console.log('Payment status updated for ID:', paymentId)
        // TODO: Actualizar estado del pedido en Supabase
      }
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}