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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ¡Bienvenido a Mercadillo!</h1>
  </div>
  
  <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hola <strong>${nombre}</strong>,</p>
    
    <p>Nos alegra mucho que te hayas unido a nuestra comunidad. En Mercadillo encontrarás los mejores productos al mejor precio.</p>
    
    <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 5px;">
      <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>🎁 Regalo de Bienvenida</strong></p>
      <p style="margin: 0; font-size: 14px;">Usa el cupón <code style="background: #667eea; color: white; padding: 5px 10px; border-radius: 4px; font-size: 16px; font-weight: bold;">BIENVENIDA10</code> para obtener <strong>10% de descuento</strong> en tu primera compra.</p>
    </div>
    
    <p>¿Qué puedes hacer ahora?</p>
    <ul style="line-height: 2;">
      <li>🛍️ Explora nuestro catálogo de productos</li>
      <li>💳 Completa tu perfil para una experiencia más rápida</li>
      <li>📦 Realiza tu primera compra con descuento</li>
    </ul>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.VITE_APP_URL || 'https://mercadillo.app'}/catalog" 
         style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Ver Productos
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Mercadillo. Todos los derechos reservados.</p>
    <p>Lima, Perú</p>
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
      subject: `🎉 ¡Bienvenido a Mercadillo!`,
      html: getWelcomeEmailHTML(nombre),
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
