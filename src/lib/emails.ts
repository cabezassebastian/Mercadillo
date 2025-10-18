// ============================================
// INTERFACES
// ============================================

export interface EmailConfirmacionPedido {
  email: string
  nombre: string
  pedido: {
    id: string
    fecha_creacion: string
    total: number
    subtotal: number
    descuento: number
    cupon_codigo?: string
  }
  items: Array<{
    producto_id: string
    nombre: string
    cantidad: number
    precio_unitario: number
  }>
  direccion: {
    nombre_completo: string
    telefono: string
    direccion: string
    ciudad: string
    codigo_postal: string
    referencia?: string
  }
}

export interface EmailEnvio {
  email: string
  nombre: string
  numero_pedido: string
  fecha_envio: string
  numero_seguimiento?: string
  items: Array<{
    nombre: string
    cantidad: number
  }>
}

export interface EmailEntrega {
  email: string
  nombre: string
  numero_pedido: string
  fecha_entrega: string
  items: Array<{
    nombre: string
    cantidad: number
    producto_id: string
  }>
}

export interface EmailBienvenida {
  email: string
  nombre: string
}

// ============================================
// FUNCIONES DE ENVÍO
// ============================================

/**
 * Envía email de confirmación de pedido después del pago exitoso
 */
export async function enviarEmailConfirmacionPedido(data: EmailConfirmacionPedido) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'order_confirmation', payload: data }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error sending order confirmation:', error)
      return { success: false, error }
    }

    const result = await response.json()
    console.log('✅ Order confirmation sent:', result.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('❌ Error in enviarEmailConfirmacionPedido:', error)
    return { success: false, error }
  }
}

/**
 * Envía email cuando el pedido es marcado como "Enviado"
 */
export async function enviarEmailEnvio(data: EmailEnvio) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'shipping', payload: data }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error sending shipping notification:', error)
      return { success: false, error }
    }

    const result = await response.json()
    console.log('✅ Shipping notification sent:', result.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('❌ Error in enviarEmailEnvio:', error)
    return { success: false, error }
  }
}

/**
 * Envía email cuando el pedido es marcado como "Entregado"
 */
export async function enviarEmailEntrega(data: EmailEntrega) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'delivery', payload: data }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error sending delivery confirmation:', error)
      return { success: false, error }
    }

    const result = await response.json()
    console.log('✅ Delivery confirmation sent:', result.id)
    return { success: true, data: result }
  } catch (error) {
    console.error('❌ Error in enviarEmailEntrega:', error)
    return { success: false, error }
  }
}

/**
 * Envía email de bienvenida al crear perfil nuevo
 */
export async function enviarEmailBienvenida(data: EmailBienvenida) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'welcome', payload: { email: data.email, nombre: data.nombre } }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error sending welcome email:', error)
      return { success: false, error }
    }

    const result = await response.json()
    console.log('✅ Welcome email sent to:', data.email)
    return { success: true, data: result }
  } catch (error) {
    console.error('❌ Error in enviarEmailBienvenida:', error)
    return { success: false, error }
  }
}
