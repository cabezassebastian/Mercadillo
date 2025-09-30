import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Configurar cliente de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      options: {
        timeout: 5000,
      }
    })

    const payment = new Payment(client)

    // Obtener el ID del pago desde la URL
    const { paymentId } = req.query

    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'Payment ID es requerido' })
    }

    // Consultar el estado del pago
    const paymentInfo = await payment.get({ id: paymentId })

    if (!paymentInfo) {
      return res.status(404).json({ error: 'Pago no encontrado' })
    }

    // Retornar información del pago
    res.status(200).json({
      id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      payment_method_id: paymentInfo.payment_method_id,
      payment_type_id: paymentInfo.payment_type_id,
      transaction_amount: paymentInfo.transaction_amount,
      currency_id: paymentInfo.currency_id,
      date_created: paymentInfo.date_created,
      date_approved: paymentInfo.date_approved,
      external_reference: paymentInfo.external_reference,
      payer: {
        email: paymentInfo.payer?.email,
        identification: paymentInfo.payer?.identification
      }
    })

  } catch (error) {
    console.error('Error al consultar estado del pago:', error)
    
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}