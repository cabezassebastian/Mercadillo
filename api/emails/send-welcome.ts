import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.VITE_RESEND_API_KEY)

// Simple HTML template for welcome email
const getWelcomeEmailHTML = (nombre: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Mercadillo</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #FFD700 0%, #b8860b 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #333333; margin: 0; font-size: 28px; font-weight: bold;">🎉 ¡Bienvenido a Mercadillo!</h1>
  </div>
  
  <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0; color: #333333;">Hola <strong>${nombre}</strong>,</p>
    
    <p style="color: #333333;">Nos alegra mucho que te hayas unido a nuestra comunidad. En Mercadillo encontrarás los mejores productos al mejor precio.</p>
    
    <p style="color: #333333; margin-top: 30px;"><strong>¿Qué puedes hacer ahora?</strong></p>
    <ul style="line-height: 2; color: #333333;">
      <li>🛍️ Explora nuestro catálogo de productos</li>
      <li>� Completa tu perfil para una experiencia más rápida</li>
      <li>⭐ Descubre nuestros productos más vendidos</li>
    </ul>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.VITE_APP_URL || 'https://mercadillo.app'}/catalogo" 
         style="background: #FFD700; color: #333333; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background 0.2s;">
        Ver Catálogo
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">© ${new Date().getFullYear()} Mercadillo. Todos los derechos reservados.</p>
    <p style="margin: 5px 0;">Lima, Perú</p>
  </div>
</body>
</html>
`

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
      subject: `Bienvenido a Mercadillo ${nombre}`,
      html: getWelcomeEmailHTML(nombre),
      headers: {
        'X-Entity-Ref-ID': `welcome-${Date.now()}`,
      },
      tags: [
        {
          name: 'category',
          value: 'welcome'
        }
      ],
    })

    if (error) {
      console.error('❌ Error sending welcome email:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('✅ Welcome email sent:', data?.id)
    return res.status(200).json({ success: true, id: data?.id })
  } catch (error: any) {
    console.error('❌ Error in send-welcome:', error)
    return res.status(500).json({ error: error?.message || 'Internal server error' })
  }
}
