import { VercelRequest, VercelResponse } from '@vercel/node'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import { findOrderByExternalReference, updateOrderWithMercadoPago } from '../../src/lib/orders'
import { registrarUsoCupon } from '../../src/lib/cupones'
import { enviarEmailConfirmacionPedido } from '../../src/lib/emails'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Configurar clientes
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
    })

    const payment = new Payment(mpClient)

    const { type, data } = req.body

    console.log('Mercado Pago webhook received:', { type, data })

    // Verificar que es una notificación de pago
    if (type === 'payment') {
      const paymentId = data.id
      
      console.log('Payment notification:', {
        paymentId,
        action: data.action
      })

      // Obtener información completa del pago desde MercadoPago
      try {
        const paymentInfo = await payment.get({ id: paymentId })
        
        console.log('Payment info from MercadoPago:', {
          id: paymentInfo.id,
          status: paymentInfo.status,
          external_reference: paymentInfo.external_reference,
          transaction_amount: paymentInfo.transaction_amount
        })

        // Buscar el pedido en Supabase usando external_reference
        if (paymentInfo.external_reference) {
          // Decodificar el external_reference para obtener los datos del pedido
          const [refId, encodedData] = paymentInfo.external_reference.split('|')
          
          let orderData: any = null
          if (encodedData) {
            try {
              const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8')
              orderData = JSON.parse(decodedData)
            } catch (decodeError) {
              console.error('Error decoding order data:', decodeError)
            }
          }

          // Buscar si ya existe un pedido con este external_reference
          const orderResult = await findOrderByExternalReference(refId)
          
          let order = orderResult.data

          // Si no existe el pedido y tenemos los datos, crearlo ahora
          if (!order && orderData && paymentInfo.status === 'approved') {
            console.log('Creating order from payment approval:', {
              external_reference: refId,
              user_id: orderData.user_id
            })

            const { data: newOrder, error: createError } = await supabase
              .from('pedidos')
              .insert([{
                usuario_id: orderData.user_id,
                items: orderData.items,
                subtotal: orderData.subtotal,
                descuento: orderData.descuento || 0,
                cupon_codigo: orderData.cupon_codigo || null,
                total: orderData.total,
                estado: 'completado',
                direccion_envio: orderData.shipping_address,
                metodo_pago: 'mercadopago',
                mercadopago_external_reference: refId,
                mercadopago_preference_id: paymentInfo.id?.toString(),
                mercadopago_payment_id: paymentInfo.id?.toString(),
                mercadopago_status: paymentInfo.status,
                mercadopago_status_detail: paymentInfo.status_detail || '',
                mercadopago_payment_type: paymentInfo.payment_type_id || '',
                // Datos de entrega
                metodo_entrega: orderData.delivery_data?.metodo_entrega || orderData.metadata?.metodo_entrega || 'envio',
                telefono_contacto: orderData.delivery_data?.telefono || orderData.metadata?.telefono_contacto || '',
                dni_cliente: orderData.delivery_data?.dni || orderData.metadata?.dni_cliente || '',
                nombre_completo: orderData.delivery_data?.nombre_completo || '',
                notas_entrega: null
              }])
              .select()
              .single()

            if (createError) {
              console.error('Error creating order:', createError)
              return res.status(500).json({ 
                error: 'Error creating order',
                details: createError.message
              })
            }

            order = newOrder
            console.log('Order created successfully:', {
              orderId: newOrder.id,
              status: newOrder.estado
            })

            // Registrar uso del cupón si se aplicó uno
            if (orderData.cupon_codigo && orderData.descuento > 0) {
              console.log('Registering coupon usage:', {
                cupon_codigo: orderData.cupon_codigo,
                descuento: orderData.descuento,
                orderId: newOrder.id
              })

              try {
                // Obtener el ID del cupón desde la base de datos
                const { data: cuponData, error: cuponError } = await supabase
                  .from('cupones')
                  .select('id')
                  .eq('codigo', orderData.cupon_codigo)
                  .single()

                if (cuponError) {
                  console.error('Error fetching coupon:', cuponError)
                } else if (cuponData) {
                  // Registrar el uso del cupón
                  const registrado = await registrarUsoCupon(
                    cuponData.id,
                    orderData.user_id,
                    newOrder.id,
                    orderData.descuento
                  )

                  if (registrado) {
                    console.log('Coupon usage registered successfully')
                  } else {
                    console.error('Failed to register coupon usage')
                  }
                }
              } catch (cuponRegisterError) {
                console.error('Error registering coupon usage:', cuponRegisterError)
                // No fallar el webhook por error en el cupón
              }
            }

          } else if (order) {
            // Si el pedido ya existe, actualizarlo con la información del pago
            const updateResult = await updateOrderWithMercadoPago(order.id, {
              payment_id: paymentInfo.id?.toString(),
              status: paymentInfo.status || 'unknown',
              status_detail: paymentInfo.status_detail || '',
              payment_type: paymentInfo.payment_type_id || ''
            })

            if (updateResult.error) {
              console.error('Error updating order:', updateResult.error)
              return res.status(500).json({ 
                error: 'Error updating order',
                details: updateResult.error
              })
            }

            console.log('Order updated successfully:', {
              orderId: order.id,
              paymentStatus: paymentInfo.status,
              orderStatus: updateResult.data?.estado
            })
          } else {
            // No hay datos del pedido y no se encontró en la BD
            console.warn('Payment received but no order data available:', refId)
            return res.status(200).json({ 
              received: true, 
              message: 'Payment processed but order data not available' 
            })
          }

          // Enviar email de confirmación si el pago fue aprobado
          if (paymentInfo.status === 'approved' && order) {
            console.log('Payment approved - order completed:', order.id)
            
            // Enviar email de confirmación
            try {
              // Obtener información del usuario
              const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('email, nombre_completo')
                .eq('usuario_id', orderData?.user_id || order.usuario_id)
                .single()

              if (!userError && userData) {
                // Parsear dirección de envío (viene como string JSON)
                let direccionParsed: any
                try {
                  direccionParsed = typeof order.direccion_envio === 'string' 
                    ? JSON.parse(order.direccion_envio)
                    : order.direccion_envio
                } catch {
                  direccionParsed = {
                    nombre_completo: userData.nombre_completo,
                    telefono: '',
                    direccion: order.direccion_envio,
                    ciudad: '',
                    codigo_postal: '',
                    referencia: ''
                  }
                }

                await enviarEmailConfirmacionPedido({
                  email: userData.email,
                  nombre: userData.nombre_completo,
                  pedido: {
                    id: order.id,
                    fecha_creacion: order.created_at,
                    total: order.total,
                    subtotal: order.subtotal,
                    descuento: order.descuento || 0,
                    cupon_codigo: order.cupon_codigo
                  },
                  items: order.items.map((item: any) => ({
                    producto_id: item.id || item.producto_id,
                    nombre: item.title || item.nombre,
                    cantidad: item.quantity || item.cantidad,
                    precio_unitario: item.price || item.precio_unitario
                  })),
                  direccion: direccionParsed
                })

                console.log('Confirmation email sent successfully')
              } else {
                console.error('Error fetching user data for email:', userError)
              }
            } catch (emailError) {
              console.error('Error sending confirmation email:', emailError)
              // No fallar el webhook por error en el email
            }
          }
        } else {
          console.warn('Payment received without external_reference:', paymentId)
        }

      } catch (mpError) {
        console.error('Error fetching payment from MercadoPago:', mpError)
        return res.status(500).json({ 
          error: 'Error fetching payment details',
          paymentId
        })
      }
    } else {
      console.log('Non-payment webhook received:', type)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}