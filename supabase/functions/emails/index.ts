import { serve } from "https://deno.land/std@0.201.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tipos de acciones de email
type EmailAction = 'order_confirmation' | 'shipping' | 'delivery' | 'welcome'

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { action, payload } = body as { action?: EmailAction; payload?: any }

    if (!action || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing action or payload' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Common from/to
    const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Mercadillo'
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'pedidos@mercadillo.app'
    const from = `${fromName} <${fromEmail}>`

    let emailSubject = ''
    let emailHtml = ''

    if (action === 'order_confirmation') {
      const { email, nombre, pedido, items, direccion } = payload
      if (!email || !nombre || !pedido || !items || !direccion) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for order confirmation' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      emailSubject = `✅ Pedido Confirmado #${pedido.id.slice(0, 8).toUpperCase()}`
      emailHtml = generateOrderConfirmationHTML(nombre, pedido, items, direccion)
      
      const response = await sendEmail(RESEND_API_KEY, from, email, emailSubject, emailHtml)
      return new Response(
        JSON.stringify(response), 
        { status: response.error ? 500 : 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'shipping') {
      const { email, nombre, numero_pedido, fecha_envio, items } = payload
      if (!email || !nombre || !numero_pedido || !fecha_envio || !items) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for shipping' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      emailSubject = `📦 ¡Tu pedido está en camino! #${numero_pedido.slice(0, 8).toUpperCase()}`
      emailHtml = generateShippingEmailHTML(nombre, numero_pedido, fecha_envio, items)

      const response = await sendEmail(RESEND_API_KEY, from, email, emailSubject, emailHtml)
      return new Response(
        JSON.stringify(response), 
        { status: response.error ? 500 : 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'delivery') {
      const { email, nombre, numero_pedido, fecha_entrega, items } = payload
      if (!email || !nombre || !numero_pedido || !fecha_entrega || !items) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for delivery' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      emailSubject = `🎉 ¡Tu pedido ha sido entregado! #${numero_pedido.slice(0, 8).toUpperCase()}`
      emailHtml = generateDeliveryEmailHTML(nombre, numero_pedido, fecha_entrega, items)

      const response = await sendEmail(RESEND_API_KEY, from, email, emailSubject, emailHtml)
      return new Response(
        JSON.stringify(response), 
        { status: response.error ? 500 : 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'welcome') {
      const { email, nombre } = payload
      if (!email || !nombre) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for welcome' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      emailSubject = `Bienvenido a Mercadillo ${nombre}`
      emailHtml = getWelcomeEmailHTML(nombre)

      const response = await sendEmail(RESEND_API_KEY, from, email, emailSubject, emailHtml)
      return new Response(
        JSON.stringify(response), 
        { status: response.error ? 500 : 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('Error in email endpoint:', err)
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to send email via Resend API
async function sendEmail(apiKey: string, from: string, to: string, subject: string, html: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error sending email:', data)
      return { success: false, error: data.message || 'Failed to send email' }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error in sendEmail:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// HTML Templates
function generateOrderConfirmationHTML(nombre: string, pedido: any, items: any[], direccion: any): string {
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.cantidad}x ${item.nombre}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">S/ ${item.precio_unitario.toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Pedido Confirmado</title></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: #10b981; margin: 0;">✅ ¡Pedido Confirmado!</h1>
      </div>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu pedido <strong>#${pedido.id.slice(0, 8).toUpperCase()}</strong> ha sido confirmado exitosamente.</p>
      <h3>Resumen del Pedido:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${itemsHtml}
        <tr>
          <td style="padding: 10px; border-top: 2px solid #333;"><strong>Total</strong></td>
          <td style="padding: 10px; border-top: 2px solid #333; text-align: right;"><strong>S/ ${pedido.total.toFixed(2)}</strong></td>
        </tr>
      </table>
      <h3>Dirección de Envío:</h3>
      <p>${direccion.direccion}<br>${direccion.ciudad || 'Lima'}, Perú</p>
      <p style="margin-top: 30px; color: #666;">Gracias por tu compra,<br><strong>Equipo Mercadillo</strong></p>
    </body>
    </html>
  `
}

function generateShippingEmailHTML(nombre: string, numero_pedido: string, fecha_envio: string, items: any[]): string {
  const itemsList = items.map((i: any) => `<li>${i.cantidad}x ${i.nombre}</li>`).join('')
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>📦 Tu pedido está en camino</h1>
      <p>Hola ${nombre},</p>
      <p>Tu pedido <strong>#${numero_pedido.slice(0,8).toUpperCase()}</strong> fue enviado el ${new Date(fecha_envio).toLocaleDateString('es-PE')}</p>
      <ul>${itemsList}</ul>
      <p>Gracias por tu compra,<br><strong>Equipo Mercadillo</strong></p>
    </body>
    </html>
  `
}

function generateDeliveryEmailHTML(nombre: string, numero_pedido: string, fecha_entrega: string, items: any[]): string {
  const itemsList = items.map((i: any) => `<li>${i.cantidad}x ${i.nombre}</li>`).join('')
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>🎉 Tu pedido ha sido entregado</h1>
      <p>Hola ${nombre},</p>
      <p>Tu pedido <strong>#${numero_pedido.slice(0,8).toUpperCase()}</strong> fue entregado el ${new Date(fecha_entrega).toLocaleDateString('es-PE')}</p>
      <ul>${itemsList}</ul>
      <p>Esperamos que disfrutes tu compra. ¡Gracias por confiar en nosotros!</p>
      <p>Equipo Mercadillo</p>
    </body>
    </html>
  `
}

function getWelcomeEmailHTML(nombre: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>🎉 Bienvenido a Mercadillo</h1>
      <p>Hola ${nombre},</p>
      <p>Gracias por unirte a Mercadillo. Estamos emocionados de tenerte con nosotros.</p>
      <p>Explora nuestro catálogo y encuentra los mejores productos en Lima, Perú.</p>
      <p>¡Felices compras!<br><strong>Equipo Mercadillo</strong></p>
    </body>
    </html>
  `
}
