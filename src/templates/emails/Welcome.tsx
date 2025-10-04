import type { EmailBienvenida } from '../../lib/emails'

export const WelcomeEmail = (props: EmailBienvenida) => {
  const { nombre } = props

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
            background: linear-gradient(135deg, #c9a961 0%, #a68943 100%); 
            color: white; 
            padding: 40px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px 20px; }
          .welcome-icon { font-size: 64px; text-align: center; margin: 20px 0; }
          .section { margin-bottom: 25px; }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 12px; 
            display: flex;
            align-items: center;
          }
          .feature-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-top: 20px;
          }
          .feature-card { 
            background-color: #f9fafb; 
            padding: 20px; 
            border-radius: 8px;
            text-align: center;
            border: 2px solid #e5e7eb;
          }
          .feature-icon { font-size: 32px; margin-bottom: 10px; }
          .feature-title { 
            font-size: 14px; 
            font-weight: bold; 
            color: #333; 
            margin: 8px 0 5px 0;
          }
          .feature-text { 
            font-size: 12px; 
            color: #666; 
            margin: 0;
          }
          .cta-box { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            padding: 25px; 
            border-radius: 8px; 
            text-align: center;
            margin: 25px 0;
            border: 2px solid #f59e0b;
          }
          .button { 
            display: inline-block; 
            background-color: #c9a961; 
            color: white; 
            padding: 14px 28px; 
            border-radius: 6px; 
            text-decoration: none; 
            margin-top: 15px;
            font-weight: bold;
            font-size: 16px;
          }
          .tips-list { 
            background-color: #eff6ff; 
            padding: 20px; 
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .tip-item { 
            padding: 8px 0; 
            font-size: 14px;
            color: #1e40af;
            line-height: 1.6;
          }
          .footer { 
            background-color: #1f2937; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
          }
          .footer a { color: #c9a961; text-decoration: none; }
          .social-links { 
            margin: 15px 0; 
          }
          .social-links a { 
            margin: 0 10px; 
            color: #c9a961; 
            font-size: 24px;
            text-decoration: none;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1>¡Bienvenido a Mercadillo! 👋</h1>
          </div>

          {/* Content */}
          <div className="content">
            <div className="welcome-icon">🎉</div>
            
            <p style={{ fontSize: '18px', color: '#333', textAlign: 'center', marginBottom: '10px' }}>
              ¡Hola <strong>{nombre}</strong>!
            </p>
            
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', lineHeight: '1.6', marginBottom: '25px' }}>
              Estamos encantados de tenerte como parte de nuestra comunidad. 
              En Mercadillo encontrarás los mejores productos con la mejor calidad y precios.
            </p>

            {/* Características */}
            <div className="section">
              <div className="section-title">
                ✨ ¿Qué puedes hacer en Mercadillo?
              </div>
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon">🛍️</div>
                  <div className="feature-title">Compra Fácil</div>
                  <div className="feature-text">
                    Proceso de compra simple y seguro
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💳</div>
                  <div className="feature-title">Pago Seguro</div>
                  <div className="feature-text">
                    Con MercadoPago, 100% protegido
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🚚</div>
                  <div className="feature-title">Envío Rápido</div>
                  <div className="feature-text">
                    Recibe en 2-5 días hábiles
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎫</div>
                  <div className="feature-title">Cupones</div>
                  <div className="feature-text">
                    Descuentos exclusivos para ti
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="cta-box">
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', marginBottom: '10px' }}>
                🎁 Regalo de Bienvenida
              </div>
              <p style={{ fontSize: '14px', color: '#92400e', margin: '10px 0' }}>
                Usa el cupón <strong>BIENVENIDA10</strong> y obtén <strong>10% de descuento</strong> 
                en tu primera compra mayor a S/50
              </p>
              <a 
                href={`${import.meta.env.VITE_APP_URL || 'https://mercadillo.com'}/catalog`} 
                className="button"
              >
                Empezar a Comprar
              </a>
            </div>

            {/* Tips Útiles */}
            <div className="section">
              <div className="section-title">
                💡 Tips para aprovechar mejor tu cuenta
              </div>
              <div className="tips-list">
                <div className="tip-item">
                  <strong>1. Completa tu perfil</strong> - Guarda tus direcciones favoritas para comprar más rápido
                </div>
                <div className="tip-item">
                  <strong>2. Activa las notificaciones</strong> - Entérate de nuevos productos y ofertas especiales
                </div>
                <div className="tip-item">
                  <strong>3. Revisa tus pedidos</strong> - Sigue el estado de tus compras en tiempo real
                </div>
                <div className="tip-item">
                  <strong>4. Deja reseñas</strong> - Ayuda a otros compradores compartiendo tu experiencia
                </div>
              </div>
            </div>

            {/* Soporte */}
            <div style={{ 
              backgroundColor: '#f9fafb', 
              padding: '20px', 
              borderRadius: '8px',
              textAlign: 'center',
              margin: '20px 0'
            }}>
              <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                ¿Necesitas ayuda?
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                Estamos aquí para ti 7 días a la semana
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                📧 <a href="mailto:soporte@mercadillo.com" style={{ color: '#c9a961', textDecoration: 'none' }}>
                  soporte@mercadillo.com
                </a>
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                📱 WhatsApp: +51 999 999 999
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="social-links">
              <a href="https://facebook.com/mercadillo">📘</a>
              <a href="https://instagram.com/mercadillo">📷</a>
              <a href="https://twitter.com/mercadillo">🐦</a>
            </div>
            <p style={{ margin: '10px 0' }}>
              ¿Tienes preguntas? Escríbenos a{' '}
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
