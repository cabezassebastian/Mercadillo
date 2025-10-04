import type { EmailConfirmacionPedido } from '../../lib/emails'

export const OrderConfirmationEmail = (props: EmailConfirmacionPedido) => {
  const { nombre, pedido, items, direccion } = props

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
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .success-badge { 
            background-color: #10b981; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px; 
            display: inline-block; 
            font-size: 14px; 
            margin-bottom: 20px;
          }
          .order-id { 
            font-size: 18px; 
            color: #666; 
            margin-bottom: 30px; 
          }
          .section { margin-bottom: 30px; }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #c9a961;
            padding-bottom: 8px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          th { 
            background-color: #f9fafb; 
            padding: 12px; 
            text-align: left; 
            font-weight: bold; 
            color: #666;
            font-size: 14px;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          .text-right { text-align: right; }
          .total-row { 
            background-color: #fef3c7; 
            font-weight: bold; 
            font-size: 16px; 
          }
          .discount-row { 
            color: #10b981; 
            font-weight: 600; 
          }
          .address-box { 
            background-color: #f9fafb; 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #c9a961;
          }
          .footer { 
            background-color: #1f2937; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
          }
          .footer a { color: #c9a961; text-decoration: none; }
          .button { 
            display: inline-block; 
            background-color: #c9a961; 
            color: white; 
            padding: 12px 24px; 
            border-radius: 6px; 
            text-decoration: none; 
            margin-top: 20px;
            font-weight: bold;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1>¡Gracias por tu compra! 🎉</h1>
          </div>

          {/* Content */}
          <div className="content">
            <div className="success-badge">✅ Pago Confirmado</div>
            
            <p style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
              Hola <strong>{nombre}</strong>,
            </p>
            
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Hemos recibido tu pedido correctamente y ya estamos preparándolo para el envío. 
              Te mantendremos informado sobre el estado de tu pedido.
            </p>

            <div className="order-id">
              Pedido: <strong>#{pedido.id.slice(0, 8).toUpperCase()}</strong>
            </div>

            {/* Resumen de Productos */}
            <div className="section">
              <div className="section-title">📦 Resumen del Pedido</div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-right">Cantidad</th>
                    <th className="text-right">Precio</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nombre}</td>
                      <td className="text-right">{item.cantidad}</td>
                      <td className="text-right">S/ {item.precio_unitario.toFixed(2)}</td>
                      <td className="text-right">
                        S/ {(item.cantidad * item.precio_unitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: '600' }}>
                      Subtotal:
                    </td>
                    <td className="text-right">S/ {pedido.subtotal.toFixed(2)}</td>
                  </tr>
                  {pedido.descuento > 0 && (
                    <tr className="discount-row">
                      <td colSpan={3} style={{ textAlign: 'right' }}>
                        Descuento {pedido.cupon_codigo && `(${pedido.cupon_codigo})`}:
                      </td>
                      <td className="text-right">-S/ {pedido.descuento.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="total-row">
                    <td colSpan={3} style={{ textAlign: 'right' }}>
                      TOTAL:
                    </td>
                    <td className="text-right">S/ {pedido.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dirección de Envío */}
            <div className="section">
              <div className="section-title">🚚 Dirección de Envío</div>
              <div className="address-box">
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>{direccion.nombre_completo}</strong>
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  📞 {direccion.telefono}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  📍 {direccion.direccion}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  {direccion.ciudad} - {direccion.codigo_postal}
                </p>
                {direccion.referencia && (
                  <p style={{ margin: '5px 0', fontSize: '14px', fontStyle: 'italic' }}>
                    Ref: {direccion.referencia}
                  </p>
                )}
              </div>
            </div>

            {/* Próximos Pasos */}
            <div className="section">
              <div className="section-title">📋 ¿Qué sigue?</div>
              <ol style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                <li>Procesaremos tu pedido en las próximas 24 horas</li>
                <li>Te enviaremos un email cuando tu pedido sea enviado</li>
                <li>Recibirás tu pedido en 2-5 días hábiles</li>
              </ol>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a 
                href={`${import.meta.env.VITE_APP_URL || 'https://mercadillo.com'}/orders`} 
                className="button"
              >
                Ver mi pedido
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p style={{ margin: '10px 0' }}>
              ¿Tienes alguna pregunta? Contáctanos en{' '}
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
