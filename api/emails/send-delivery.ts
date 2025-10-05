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
      background: linear-gradient(135deg, #FFD700 0%, #FFD700 100%); 
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
    .success-icon { 
      font-size: 80px; 
      animation: scaleIn 0.6s ease-out;
      display: inline-block;
    }
    @keyframes scaleIn {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }
    .confetti {
      font-size: 40px;
      opacity: 0.6;
      animation: float 3s ease-in-out infinite;
      display: inline-block;
      margin: 0 10px;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(10deg); }
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      text-align: center;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .greeting span {
      color: #FFD700;
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
      background: linear-gradient(135deg, #FFD700 0%, #FFD700 100%);
      color: #333333;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      margin: 0 4px;
    }
    .success-card {
      background: linear-gradient(135deg, #fff8dc 0%, #ffeaa7 100%);
      border: 2px solid #FFD700;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
    }
    .success-title {
      font-size: 20px;
      font-weight: 700;
      color: #FFD700;
      margin-bottom: 10px;
    }
    .success-subtitle {
      font-size: 14px;
      color: #666;
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
    .rating-box {
      background: linear-gradient(135deg, #fff8dc 0%, #ffeaa7 100%);
      padding: 25px;
      border-radius: 12px;
      border-left: 4px solid #FFD700;
      margin: 30px 0;
      text-align: center;
    }
    .rating-title {
      font-size: 18px;
      font-weight: 700;
      color: #333333;
      margin-bottom: 10px;
    }
    .rating-subtitle {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .stars {
      font-size: 32px;
      letter-spacing: 8px;
      margin: 15px 0;
      cursor: pointer;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #FFD700 0%, #FFD700 100%);
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
    .thank-you {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
      border: 2px dashed #FFD700;
    }
    .thank-you-title {
      font-size: 20px;
      font-weight: 700;
      color: #FFD700;
      margin-bottom: 10px;
    }
    .thank-you-text {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
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
      <h1>🎉 ¡Pedido Entregado!</h1>
    </div>
    
    <div class="content">
      <div class="icon-wrapper">
        <span class="confetti">🎊</span>
        <div class="success-icon">✅</div>
        <span class="confetti">🎉</span>
      </div>
      
      <p class="greeting">
        ¡Hola <span>${nombre}</span>!
      </p>
      
      <p class="message">
        ¡Excelentes noticias! Tu pedido <span class="order-number">#${numero_pedido.slice(0, 8).toUpperCase()}</span> 
        ha sido entregado exitosamente el ${new Date(fecha_entrega).toLocaleDateString('es-PE', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })}.
      </p>

      <div class="success-card">
        <div class="success-title">✨ Entrega Completada</div>
        <div class="success-subtitle">
          Esperamos que disfrutes tus productos
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">
          📦 Productos Recibidos
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

      <div class="rating-box">
        <div class="rating-title">⭐ ¿Cómo fue tu experiencia?</div>
        <div class="rating-subtitle">
          Tu opinión es muy importante para nosotros y nos ayuda a mejorar cada día. 
          ¿Te gustaría compartir tu experiencia?
        </div>
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <center>
          <a href="https://www.mercadillo.app/perfil/reseñas" class="cta-button">
            Dejar una Reseña
          </a>
        </center>
      </div>

      <div class="thank-you">
        <div class="thank-you-title">💛 ¡Gracias por tu compra!</div>
        <div class="thank-you-text">
          Apreciamos mucho tu confianza en Mercadillo. 
          Esperamos verte pronto de nuevo.
        </div>
      </div>

      <center>
        <a href="https://mercadillo.app/catalogo" class="cta-button">
          Seguir Comprando
        </a>
      </center>
    </div>

    <div class="footer">
      <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
        ¿Algún problema con tu pedido?
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
