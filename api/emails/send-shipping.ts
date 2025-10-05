import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY)

const generateShippingEmailHTML = (nombre: string, numero_pedido: string, fecha_envio: string, items: any[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .shipping-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
    .section-title { font-size: 18px; font-weight: bold; color: #333; margin: 20px 0 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
    .item-list { background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    .item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .item:last-child { border-bottom: none; }
    .info-box { background: #eff6ff; padding: 15px; border-radius: 6px; border: 1px solid #3b82f6; font-size: 14px; color: #1e40af; margin: 20px 0; }
    .footer { background-color: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Tu pedido está en camino</h1>
    </div>
    <div class="content">
      <div class="shipping-icon">🚚</div>
      <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 10px;">
        ¡Hola <strong>${nombre}</strong>!
      </p>
      <p style="font-size: 14px; color: #666; text-align: center; line-height: 1.6;">
        Tu pedido <strong>#${numero_pedido.slice(0, 8).toUpperCase()}</strong> ha sido enviado
        el ${new Date(fecha_envio).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}.
      </p>
      <div class="section-title">📋 Productos en Camino</div>
      <div class="item-list">
        ${items.map(item => `<div class="item"><strong>${item.cantidad}x</strong> ${item.nombre}</div>`).join('')}
      </div>
      <div class="info-box">
        <strong>💡 Tip:</strong> Por favor, mantén tu teléfono disponible. El courier podría contactarte para coordinar la entrega.
      </div>
    </div>
    <div class="footer">
      <p style="margin: 10px 0;">¿Necesitas ayuda? Escríbenos a <a href="mailto:pedidos@mercadillo.app">pedidos@mercadillo.app</a></p>
      <p style="margin: 10px 0; font-size: 12px; color: #9ca3af;">© 2025 Mercadillo. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`

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
      html: generateShippingEmailHTML(nombre, numero_pedido, fecha_envio, items),
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
