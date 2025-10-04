import { Resend } from 'resend'
import { render } from '@react-email/render'
import { 
  OrderConfirmationEmail, 
  ShippingNotificationEmail, 
  DeliveryConfirmationEmail, 
  WelcomeEmail 
} from '../templates/emails/index'

// Inicializar cliente de Resend
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY)

// Configuración de email
const EMAIL_FROM = import.meta.env.VITE_EMAIL_FROM || 'noreply@mercadillo.com'
const EMAIL_FROM_NAME = import.meta.env.VITE_EMAIL_FROM_NAME || 'Mercadillo'

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
    const { data: emailData, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: data.email,
      subject: `✅ Pedido Confirmado #${data.pedido.id.slice(0, 8).toUpperCase()}`,
      html: await render(OrderConfirmationEmail(data)),
    })

    if (error) {
      console.error('❌ Error enviando email de confirmación:', error)
      return { success: false, error }
    }

    console.log('✅ Email de confirmación enviado:', emailData?.id)
    return { success: true, data: emailData }
  } catch (error) {
    console.error('❌ Error en enviarEmailConfirmacionPedido:', error)
    return { success: false, error }
  }
}

/**
 * Envía email cuando el pedido es marcado como "Enviado"
 */
export async function enviarEmailEnvio(data: EmailEnvio) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: data.email,
      subject: `📦 Tu pedido #${data.numero_pedido.slice(0, 8).toUpperCase()} está en camino`,
      html: await render(ShippingNotificationEmail(data)),
    })

    if (error) {
      console.error('❌ Error enviando email de envío:', error)
      return { success: false, error }
    }

    console.log('✅ Email de envío enviado:', emailData?.id)
    return { success: true, data: emailData }
  } catch (error) {
    console.error('❌ Error en enviarEmailEnvio:', error)
    return { success: false, error }
  }
}

/**
 * Envía email cuando el pedido es marcado como "Entregado"
 */
export async function enviarEmailEntrega(data: EmailEntrega) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: data.email,
      subject: `🎉 Tu pedido #${data.numero_pedido.slice(0, 8).toUpperCase()} fue entregado`,
      html: await render(DeliveryConfirmationEmail(data)),
    })

    if (error) {
      console.error('❌ Error enviando email de entrega:', error)
      return { success: false, error }
    }

    console.log('✅ Email de entrega enviado:', emailData?.id)
    return { success: true, data: emailData }
  } catch (error) {
    console.error('❌ Error en enviarEmailEntrega:', error)
    return { success: false, error }
  }
}

/**
 * Envía email de bienvenida al crear perfil nuevo
 */
export async function enviarEmailBienvenida(data: EmailBienvenida) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: data.email,
      subject: `👋 ¡Bienvenido a ${EMAIL_FROM_NAME}!`,
      html: await render(WelcomeEmail(data)),
    })

    if (error) {
      console.error('❌ Error enviando email de bienvenida:', error)
      return { success: false, error }
    }

    console.log('✅ Email de bienvenida enviado:', emailData?.id)
    return { success: true, data: emailData }
  } catch (error) {
    console.error('❌ Error en enviarEmailBienvenida:', error)
    return { success: false, error }
  }
}
