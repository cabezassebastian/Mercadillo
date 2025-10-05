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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      margin: 0; 
      padding: 20px; 
      line-height: 1.6;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 10px 40px rgba(184, 134, 11, 0.15);
    }
    .header { 
      background: linear-gradient(135deg, #FFD700 0%, #b8860b 100%); 
      color: #333333; 
      padding: 40px 30px; 
      text-align: center; 
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 0;
      right: 0;
      height: 20px;
      background: #ffffff;
      border-radius: 20px 20px 0 0;
    }
    .header h1 { 
      margin: 0; 
      font-size: 28px; 
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content { 
      padding: 40px 30px; 
    }
    .icon-wrapper {
      text-align: center;
      margin-bottom: 30px;
    }
    .shipping-icon { 
      font-size: 64px; 
      animation: bounce 2s infinite;
      display: inline-block;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      text-align: center;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .greeting span {
      color: #b8860b;
    }
    .message {
      font-size: 15px;
      color: #666;
      text-align: center;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    .order-number {
      display: inline-block;
      background: linear-gradient(135deg, #FFD700 0%, #b8860b 100%);
      color: #333333;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      margin: 0 4px;
    }
    .tracking-card {
      background: linear-gradient(135deg, #fff8dc 0%, #ffeaa7 100%);
      border: 2px solid #FFD700;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
    }
    .tracking-label {
      font-size: 13px;
      color: #b8860b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .tracking-number {
      font-size: 24px;
      font-weight: 800;
      color: #333333;
      letter-spacing: 2px;
      font-family: 'Courier New', monospace;
    }
    .section {
      margin: 30px 0;
    }
    .section-title { 
      font-size: 16px; 
      font-weight: 700; 
      color: #333333; 
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #FFD700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .item-list { 
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #FFD700;
    }
    .item { 
      padding: 12px 0; 
      border-bottom: 1px solid #e9ecef;
      font-size: 15px;
      color: #333333;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .item:last-child { 
      border-bottom: none; 
    }
    .item-quantity {
      background: #FFD700;
      color: #333333;
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      min-width: 40px;
      text-align: center;
    }
    .timeline {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 12px;
      position: relative;
    }
    .timeline-item {
      position: relative;
      padding-left: 40px;
      padding-bottom: 25px;
      font-size: 15px;
    }
    .timeline-item:last-child {
      padding-bottom: 0;
    }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 8px;
      bottom: -8px;
      width: 2px;
      background: #e9ecef;
    }
    .timeline-item:last-child::before {
      display: none;
    }
    .timeline-item::after {
      content: '';
      position: absolute;
      left: 6px;
      top: 6px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      border: 3px solid #b8860b;
    }
    .timeline-item.completed::after {
      background: #FFD700;
      border-color: #b8860b;
    }
    .timeline-title {
      font-weight: 600;
      color: #333333;
      margin-bottom: 5px;
    }
    .timeline-item.completed .timeline-title {
      color: #b8860b;
    }
    .timeline-date {
      font-size: 13px;
      color: #999;
    }
    .info-box {
      background: linear-gradient(135deg, #fff8dc 0%, #ffeaa7 100%);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #b8860b;
      font-size: 14px;
      color: #333333;
      margin: 30px 0;
      line-height: 1.8;
    }
    .info-box strong {
      color: #b8860b;
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #FFD700 0%, #b8860b 100%);
      color: #333333;
      padding: 15px 35px;
      border-radius: 25px;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(184, 134, 11, 0.3);
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer { 
      background: #333333;
      color: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer a { 
      color: #FFD700;
      text-decoration: none;
      font-weight: 600;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #FFD700, transparent);
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 ¡Tu pedido va en camino!</h1>
    </div>
    
    <div class="content">
      <div class="icon-wrapper">
        <div class="shipping-icon">🚚</div>
      </div>
      
      <p class="greeting">
        ¡Hola <span>${nombre}</span>!
      </p>
      
      <p class="message">
        Tu pedido <span class="order-number">#${numero_pedido.slice(0, 8).toUpperCase()}</span> ha sido enviado 
        el ${new Date(fecha_envio).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })} 
        y está en camino hacia ti.
      </p>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">
          📋 Productos Enviados
        </div>
        <div class="item-list">
          ${items.map(item => `
            <div class="item">
              <span class="item-quantity">${item.cantidad}x</span>
              <span>${item.nombre}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          🚀 Estado de tu Envío
        </div>
        <div class="timeline">
          <div class="timeline-item completed">
            <div class="timeline-title">✓ Pedido Confirmado</div>
            <div class="timeline-date">Procesado exitosamente</div>
          </div>
          <div class="timeline-item completed">
            <div class="timeline-title">✓ Pedido Enviado</div>
            <div class="timeline-date">${new Date(fecha_envio).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</div>
          </div>
          <div class="timeline-item">
            <div class="timeline-title">En Tránsito</div>
            <div class="timeline-date">2-5 días hábiles</div>
          </div>
          <div class="timeline-item">
            <div class="timeline-title">Entregado</div>
            <div class="timeline-date">Te notificaremos</div>
          </div>
        </div>
      </div>

      <div class="info-box">
        <strong>💡 Importante:</strong> Por favor, mantén tu teléfono disponible. 
        El courier podría contactarte para coordinar la entrega en tu dirección.
      </div>

      <center>
        <a href="https://mercadillo.app/orders" class="cta-button">
          Ver Mis Pedidos
        </a>
      </center>
    </div>

    <div class="footer">
      <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
        ¿Necesitas ayuda?
      </p>
      <p style="margin: 0 0 10px 0;">
        Escríbenos a <a href="mailto:contomercadillo@gmail.com">contomercadillo@gmail.com</a>
      </p>
      <div class="divider" style="background: linear-gradient(90deg, transparent, #666, transparent);"></div>
      <p style="margin: 10px 0; font-size: 12px; color: #999;">
        © 2025 Mercadillo. Todos los derechos reservados.
      </p>
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
