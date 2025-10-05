import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { ShippingNotificationEmail } from '../../src/templates/emails/ShippingNotification'

const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, nombre, numero_pedido, fecha_envio, numero_seguimiento, items } = req.body

    if (!email || !nombre || !numero_pedido || !fecha_envio || !items) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || process.env.VITE_EMAIL_FROM_NAME || 'Mercadillo'} <${process.env.EMAIL_FROM || process.env.VITE_EMAIL_FROM || 'pedidos@mercadillo.app'}>`,
      to: email,
      subject: `📦 ¡Tu pedido está en camino! #${numero_pedido.slice(0, 8).toUpperCase()}`,
      html: await render(ShippingNotificationEmail({ 
        email, 
        nombre, 
        numero_pedido,
        fecha_envio,
        numero_seguimiento,
        items 
      })),
    })

    if (error) {
      console.error('❌ Error sending shipping notification:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('✅ Shipping notification sent:', data?.id)
    return res.status(200).json({ success: true, id: data?.id })
  } catch (error) {
    console.error('❌ Error in send-shipping:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
