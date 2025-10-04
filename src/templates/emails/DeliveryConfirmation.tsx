import type { EmailEntrega } from '../../lib/emails'

export const DeliveryConfirmationEmail = (props: EmailEntrega) => {
  const { nombre, numero_pedido, fecha_entrega, items } = props

  return (
    <html>
      <head>
        <style>{`
          body { 
            font-family: 'Arial', sans-serif; 
            background-color: #f5f5f5; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .celebration { font-size: 64px; text-align: center; margin: 20px 0; }
          .section { margin-bottom: 30px; }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #10b981;
            padding-bottom: 8px;
          }
          .item-list { 
            background-color: #f9fafb; 
            padding: 15px; 
            border-radius: 6px; 
          }
          .item { 
            padding: 8px 0; 
            border-bottom: 1px solid #e5e7eb; 
            font-size: 14px;
          }
          .item:last-child { border-bottom: none; }
          .review-box { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            margin: 20px 0;
            border: 2px solid #f59e0b;
          }
          .button { 
            display: inline-block; 
            background-color: #10b981; 
            color: white; 
            padding: 12px 24px; 
            border-radius: 6px; 
            text-decoration: none; 
            margin-top: 15px;
            font-weight: bold;
          }
          .footer { 
            background-color: #1f2937; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
          }
          .footer a { color: #10b981; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1>🎉 ¡Tu pedido fue entregado!</h1>
          </div>

          {/* Content */}
          <div className="content">
            <div className="celebration">📦✨</div>
            
            <p style={{ fontSize: '16px', color: '#333', textAlign: 'center', marginBottom: '10px' }}>
              ¡Hola <strong>{nombre}</strong>!
            </p>
            
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', lineHeight: '1.6' }}>
              Tu pedido <strong>#{numero_pedido.slice(0, 8).toUpperCase()}</strong> fue entregado exitosamente
              el {new Date(fecha_entrega).toLocaleDateString('es-PE', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}.
            </p>

            <p style={{ 
              fontSize: '16px', 
              color: '#10b981', 
              textAlign: 'center', 
              fontWeight: 'bold',
              margin: '20px 0' 
            }}>
              ¡Esperamos que disfrutes tu compra! 🎁
            </p>

            {/* Productos Entregados */}
            <div className="section">
              <div className="section-title">📋 Productos Entregados</div>
              <div className="item-list">
                {items.map((item, index) => (
                  <div key={index} className="item">
                    <strong>{item.cantidad}x</strong> {item.nombre}
                  </div>
                ))}
              </div>
            </div>

            {/* Solicitud de Reseña */}
            <div className="review-box">
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#92400e', marginBottom: '10px' }}>
                ⭐ ¿Qué te pareció tu compra?
              </div>
              <p style={{ fontSize: '14px', color: '#92400e', margin: '10px 0' }}>
                Tu opinión es muy importante para nosotros y ayuda a otros compradores.
                ¿Podrías tomarte un minuto para dejar una reseña?
              </p>
              <a 
                href={`${import.meta.env.VITE_APP_URL || 'https://mercadillo.com'}/reviews`} 
                className="button"
              >
                Dejar una reseña
              </a>
            </div>

            {/* Información de Soporte */}
            <div className="section">
              <div className="section-title">💬 ¿Algún problema con tu pedido?</div>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                Si tienes algún inconveniente con los productos recibidos, contáctanos dentro 
                de las próximas <strong>48 horas</strong> y con gusto te ayudaremos.
              </p>
              <div style={{ 
                backgroundColor: '#eff6ff', 
                padding: '15px', 
                borderRadius: '6px',
                marginTop: '15px'
              }}>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#1e40af' }}>
                  📧 Email: soporte@mercadillo.com
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#1e40af' }}>
                  📱 WhatsApp: +51 999 999 999
                </p>
              </div>
            </div>

            {/* Agradecimiento */}
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              margin: '20px 0'
            }}>
              <p style={{ fontSize: '16px', color: '#166534', fontWeight: 'bold', margin: '5px 0' }}>
                ¡Gracias por confiar en nosotros!
              </p>
              <p style={{ fontSize: '14px', color: '#15803d', margin: '10px 0' }}>
                Esperamos verte pronto de nuevo 💚
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p style={{ margin: '10px 0' }}>
              ¿Necesitas ayuda? Escríbenos a{' '}
              <a href="mailto:soporte@mercadillo.com">soporte@mercadillo.com</a>
            </p>
            <p style={{ margin: '10px 0', fontSize: '12px', color: '#9ca3af' }}>
              © 2025 Mercadillo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
