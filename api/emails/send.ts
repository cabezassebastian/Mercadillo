import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { OrderConfirmationEmail } from '../../src/templates/emails/OrderConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY)

type EmailAction = 'order_confirmation' | 'shipping' | 'delivery' | 'welcome'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { action, payload } = req.body as { action?: EmailAction; payload?: any }

    if (!action || !payload) {
      return res.status(400).json({ error: 'Missing action or payload' })
    }

    // Common from/to
    const from = `${process.env.VITE_EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Mercadillo'} <${process.env.VITE_EMAIL_FROM || process.env.EMAIL_FROM || 'pedidos@mercadillo.app'}>`

    if (action === 'order_confirmation') {
      const { email, nombre, pedido, items, direccion } = payload
      if (!email || !nombre || !pedido || !items || !direccion) {
        return res.status(400).json({ error: 'Missing required fields for order confirmation' })
      }

      const html = await render(OrderConfirmationEmail({ email, nombre, pedido, items, direccion }))

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: `✅ Pedido Confirmado #${pedido.id.slice(0, 8).toUpperCase()}`,
        html,
      })

      if (error) {
        console.error('❌ Error sending order confirmation:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ success: true, id: data?.id })
    }

    if (action === 'shipping') {
      const { email, nombre, numero_pedido, fecha_envio, items } = payload
      if (!email || !nombre || !numero_pedido || !fecha_envio || !items) {
        return res.status(400).json({ error: 'Missing required fields for shipping' })
      }

      const generateShippingEmailHTML = (nombre: string, numero_pedido: string, fecha_envio: string, items: any[]) => {
        // build a tiny HTML that includes the main fields to avoid unused var lint errors
        return `<!doctype html><html><body><div><h1>Hola ${nombre}</h1><p>Tu pedido ${numero_pedido.slice(0,8).toUpperCase()} fue enviado el ${new Date(fecha_envio).toLocaleDateString('es-PE')}</p><ul>${items.map((i: any) => `<li>${i.cantidad}x ${i.nombre}</li>`).join('')}</ul></div></body></html>`
      }

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: `📦 ¡Tu pedido está en camino! #${numero_pedido.slice(0, 8).toUpperCase()}`,
        html: generateShippingEmailHTML(nombre, numero_pedido, fecha_envio, items),
      })

      if (error) {
        console.error('❌ Error sending shipping notification:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ success: true, id: data?.id })
    }

    if (action === 'delivery') {
      const { email, nombre, numero_pedido, fecha_entrega, items } = payload
      if (!email || !nombre || !numero_pedido || !fecha_entrega || !items) {
        return res.status(400).json({ error: 'Missing required fields for delivery' })
      }

      const generateDeliveryEmailHTML = (nombre: string, numero_pedido: string, fecha_entrega: string, items: any[]) => {
        return `<!doctype html><html><body><div><h1>Hola ${nombre}</h1><p>Tu pedido ${numero_pedido.slice(0,8).toUpperCase()} fue entregado el ${new Date(fecha_entrega).toLocaleDateString('es-PE')}</p><ul>${items.map((i: any) => `<li>${i.cantidad}x ${i.nombre}</li>`).join('')}</ul></div></body></html>`
      }

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: `🎉 ¡Tu pedido ha sido entregado! #${numero_pedido.slice(0, 8).toUpperCase()}`,
        html: generateDeliveryEmailHTML(nombre, numero_pedido, fecha_entrega, items),
      })

      if (error) {
        console.error('❌ Error sending delivery confirmation:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ success: true, id: data?.id })
    }

    if (action === 'welcome') {
      const { email, nombre } = payload
      if (!email || !nombre) {
        return res.status(400).json({ error: 'Missing required fields for welcome' })
      }

      const getWelcomeEmailHTML = (nombre: string) => `<!doctype html><html><body><div>Bienvenido ${nombre}</div></body></html>`

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: `Bienvenido a Mercadillo ${nombre}`,
        html: getWelcomeEmailHTML(nombre),
        headers: {
          'X-Entity-Ref-ID': `welcome-${Date.now()}`,
        },
      })

      if (error) {
        console.error('❌ Error sending welcome email:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ success: true, id: data?.id })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (err: any) {
    console.error('❌ Error in consolidated send endpoint:', err)
    return res.status(500).json({ error: err?.message || 'Internal server error' })
  }
}
