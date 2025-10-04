import type { EmailEnvio } from '../../lib/emails'

export const ShippingNotificationEmail = (props: EmailEnvio) => {
  const { nombre, numero_pedido, fecha_envio, numero_seguimiento, items } = props

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
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .shipping-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
          .tracking-box { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            margin: 20px 0;
            border: 2px solid #f59e0b;
          }
          .tracking-number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #92400e; 
            letter-spacing: 2px;
            margin: 10px 0;
          }
          .section { margin-bottom: 30px; }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #3b82f6;
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
          .timeline { 
            position: relative; 
            padding-left: 30px; 
          }
          .timeline-item { 
            position: relative; 
            padding-bottom: 20px; 
            font-size: 14px;
            color: #666;
          }
          .timeline-item:before { 
            content: '●'; 
            position: absolute; 
            left: -30px; 
            color: #10b981; 
            font-size: 20px; 
          }
          .footer { 
            background-color: #1f2937; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
          }
          .footer a { color: #3b82f6; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1>📦 Tu pedido está en camino</h1>
          </div>

          {/* Content */}
          <div className="content">
            <div className="shipping-icon">🚚</div>
            
            <p style={{ fontSize: '16px', color: '#333', textAlign: 'center', marginBottom: '10px' }}>
              ¡Hola <strong>{nombre}</strong>!
            </p>
            
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', lineHeight: '1.6' }}>
              Tu pedido <strong>#{numero_pedido.slice(0, 8).toUpperCase()}</strong> ha sido enviado
              el {new Date(fecha_envio).toLocaleDateString('es-PE', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}.
            </p>

            {/* Número de Seguimiento */}
            {numero_seguimiento && (
              <div className="tracking-box">
                <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '5px' }}>
                  Número de Seguimiento
                </div>
                <div className="tracking-number">{numero_seguimiento}</div>
                <div style={{ fontSize: '12px', color: '#92400e', marginTop: '10px' }}>
                  Usa este número para rastrear tu pedido
                </div>
              </div>
            )}

            {/* Productos Enviados */}
            <div className="section">
              <div className="section-title">📋 Productos en Camino</div>
              <div className="item-list">
                {items.map((item, index) => (
                  <div key={index} className="item">
                    <strong>{item.cantidad}x</strong> {item.nombre}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline de Entrega */}
            <div className="section">
              <div className="section-title">🕐 Proceso de Entrega</div>
              <div className="timeline">
                <div className="timeline-item">
                  <strong style={{ color: '#10b981' }}>✓ Pedido confirmado</strong>
                </div>
                <div className="timeline-item">
                  <strong style={{ color: '#10b981' }}>✓ Pedido enviado</strong>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    {new Date(fecha_envio).toLocaleDateString('es-PE')}
                  </div>
                </div>
                <div className="timeline-item">
                  <strong>En tránsito</strong>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Estimado: 2-5 días hábiles
                  </div>
                </div>
                <div className="timeline-item">
                  <strong>Entrega</strong>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Te notificaremos cuando llegue
                  </div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div style={{ 
              backgroundColor: '#eff6ff', 
              padding: '15px', 
              borderRadius: '6px',
              border: '1px solid #3b82f6',
              fontSize: '14px',
              color: '#1e40af'
            }}>
              <strong>💡 Tip:</strong> Por favor, mantén tu teléfono disponible. 
              El courier podría contactarte para coordinar la entrega.
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
