import { VercelRequest, VercelResponse } from '@vercel/node'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import { findOrderByExternalReference, updateOrderWithMercadoPago } from '../../src/lib/orders'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Configurar clientes
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
    })

    const payment = new Payment(mpClient)

    const { type, data } = req.body

    console.log('Mercado Pago webhook received:', { type, data })

    // Verificar que es una notificación de pago
    if (type === 'payment') {
      const paymentId = data.id
      
      console.log('Payment notification:', {
        paymentId,
        action: data.action
      })

      // Obtener información completa del pago desde MercadoPago
      try {
        const paymentInfo = await payment.get({ id: paymentId })
        
        console.log('Payment info from MercadoPago:', {
          id: paymentInfo.id,
          status: paymentInfo.status,
          external_reference: paymentInfo.external_reference,
          transaction_amount: paymentInfo.transaction_amount
        })

        // Buscar el pedido en Supabase usando external_reference
        if (paymentInfo.external_reference) {
          const orderResult = await findOrderByExternalReference(paymentInfo.external_reference)
          
          if (orderResult.error || !orderResult.data) {
            console.error('Order not found for external_reference:', paymentInfo.external_reference)
            return res.status(200).json({ 
              received: true, 
              message: 'Payment processed but order not found' 
            })
          }

          const order = orderResult.data

          // Actualizar el pedido con la información del pago
          const updateResult = await updateOrderWithMercadoPago(order.id, {
            payment_id: paymentInfo.id?.toString(),
            status: paymentInfo.status || 'unknown',
            status_detail: paymentInfo.status_detail || '',
            payment_type: paymentInfo.payment_type_id || ''
          })

          if (updateResult.error) {
            console.error('Error updating order:', updateResult.error)
            return res.status(500).json({ 
              error: 'Error updating order',
              details: updateResult.error
            })
          }

          console.log('Order updated successfully:', {
            orderId: order.id,
            paymentStatus: paymentInfo.status,
            orderStatus: updateResult.data?.estado
          })

          // Enviar email de confirmación si el pago fue aprobado
          if (paymentInfo.status === 'approved') {
            console.log('Payment approved - order completed:', order.id)
            // Aquí podrías agregar lógica para enviar emails, actualizar stock, etc.
          }
        } else {
          console.warn('Payment received without external_reference:', paymentId)
        }

      } catch (mpError) {
        console.error('Error fetching payment from MercadoPago:', mpError)
        return res.status(500).json({ 
          error: 'Error fetching payment details',
          paymentId
        })
      }
    } else {
      console.log('Non-payment webhook received:', type)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}