import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { OrderConfirmationEmail } from '../../src/templates/emails/OrderConfirmation'

const resend = new Resend(process.env.VITE_RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, nombre, pedido, items, direccion } = req.body

    if (!email || !nombre || !pedido || !items || !direccion) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await resend.emails.send({
      from: `${process.env.VITE_EMAIL_FROM_NAME || 'Mercadillo'} <${process.env.VITE_EMAIL_FROM || 'pedidos@mercadillo.app'}>`,
      to: email,
      subject: `✅ Pedido Confirmado #${pedido.id.slice(0, 8).toUpperCase()}`,
      html: await render(OrderConfirmationEmail({ 
        email, 
        nombre, 
        pedido, 
        items, 
        direccion 
      })),
    })

    if (error) {
      console.error('❌ Error sending order confirmation:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('✅ Order confirmation sent:', data?.id)
    return res.status(200).json({ success: true, id: data?.id })
  } catch (error) {
    console.error('❌ Error in send-order-confirmation:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
