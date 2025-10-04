import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { WelcomeEmail } from '../../src/templates/emails/Welcome'

const resend = new Resend(process.env.VITE_RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, nombre } = req.body

    if (!email || !nombre) {
      return res.status(400).json({ error: 'Email and nombre are required' })
    }

    const { data, error } = await resend.emails.send({
      from: `${process.env.VITE_EMAIL_FROM_NAME || 'Mercadillo'} <${process.env.VITE_EMAIL_FROM || 'pedidos@mercadillo.app'}>`,
      to: email,
      subject: `🎉 ¡Bienvenido a Mercadillo!`,
      html: await render(WelcomeEmail({ email, nombre })),
    })

    if (error) {
      console.error('❌ Error sending welcome email:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('✅ Welcome email sent:', data?.id)
    return res.status(200).json({ success: true, id: data?.id })
  } catch (error) {
    console.error('❌ Error in send-welcome:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
