import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY)

const generateDeliveryEmailHTML = (nombre: string, numero_pedido: string, fecha_entrega: string, items: any[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .success-icon { font-size: 64px; text-align: center; margin-bottom: 20px; }
    .section-title { font-size: 18px; font-weight: bold; color: #333; margin: 20px 0 15px; border-bottom: 2px solid #10b981; padding-bottom: 8px; }
    .item-list { background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    .item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .item:last-child { border-bottom: none; }
    .info-box { background: #d1fae5; padding: 15px; border-radius: 6px; border: 1px solid #10b981; font-size: 14px; color: #065f46; margin: 20px 0; }
    .footer { background-color: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px; }
    .footer a { color: #10b981; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Pedido Entregado!</h1>
    </div>
    <div class="content">
      <div class="success-icon">✅</div>
      <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 10px;">
        ¡Hola <strong>${nombre}</strong>!
      </p>
      <p style="font-size: 14px; color: #666; text-align: center; line-height: 1.6;">
        Tu pedido <strong>#${numero_pedido.slice(0, 8).toUpperCase()}</strong> ha sido entregado exitosamente
        el ${new Date(fecha_entrega).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}.
      </p>
      <div class="section-title">📦 Productos Entregados</div>
      <div class="item-list">
        ${items.map(item => `<div class="item"><strong>${item.cantidad}x</strong> ${item.nombre}</div>`).join('')}
      </div>
      <div class="info-box">
        <strong>⭐ ¿Te gustó tu compra?</strong><br>
        Nos encantaría conocer tu opinión. Tu feedback nos ayuda a mejorar cada día.
      </div>
    </div>
    <div class="footer">
      <p style="margin: 10px 0;">¿Algún problema con tu pedido? Escríbenos a <a href="mailto:pedidos@mercadillo.app">pedidos@mercadillo.app</a></p>
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
    const { email, nombre, numero_pedido, fecha_entrega, items } = req.body

    if (!email || !nombre || !numero_pedido || !fecha_entrega || !items) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || process.env.VITE_EMAIL_FROM_NAME || 'Mercadillo'} <${process.env.EMAIL_FROM || process.env.VITE_EMAIL_FROM || 'pedidos@mercadillo.app'}>`,
      to: email,
      subject: `🎉 ¡Tu pedido ha sido entregado! #${numero_pedido.slice(0, 8).toUpperCase()}`,
      html: generateDeliveryEmailHTML(nombre, numero_pedido, fecha_entrega, items),
    })

    if (error) {
      console.error('❌ Error sending delivery confirmation:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('✅ Delivery confirmation sent:', data?.id)
    return res.status(200).json({ success: true, id: data?.id })
  } catch (error) {
    console.error('❌ Error in send-delivery:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
