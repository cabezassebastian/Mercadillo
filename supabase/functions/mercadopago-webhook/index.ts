import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Configurar cliente de Supabase con SERVICE_ROLE_KEY
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const mercadoPagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    // Parsear el body del webhook
    const { type, data } = await req.json()

    console.log('MercadoPago webhook received:', { type, data })

    // Verificar que es una notificación de pago
    if (type === 'payment') {
      const paymentId = data.id

      console.log('Payment notification:', {
        paymentId,
        action: data.action
      })

      // Obtener información completa del pago desde MercadoPago API
      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${mercadoPagoToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!mpResponse.ok) {
          const errorText = await mpResponse.text()
          console.error('MercadoPago API error:', errorText)
          return new Response(
            JSON.stringify({ error: 'Error fetching payment from MercadoPago', paymentId }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const paymentInfo = await mpResponse.json()

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
              // Decodificar base64 en Deno
              const decodedBytes = Uint8Array.from(atob(encodedData), c => c.charCodeAt(0))
              const decodedText = new TextDecoder().decode(decodedBytes)
              orderData = JSON.parse(decodedText)
            } catch (decodeError) {
              console.error('Error decoding order data:', decodeError)
            }
          }

          // Buscar si ya existe un pedido con este external_reference
          const { data: existingOrders, error: findError } = await supabase
            .from('pedidos')
            .select('*')
            .eq('mercadopago_external_reference', refId)

          if (findError) {
            console.error('Error finding order:', findError)
            return new Response(
              JSON.stringify({ error: 'Error finding order', details: findError.message }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          let order = existingOrders && existingOrders.length > 0 ? existingOrders[0] : null

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
                google_maps_url: orderData.delivery_data?.google_maps_url || null,
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
              return new Response(
                JSON.stringify({ error: 'Error creating order', details: createError.message }),
                { 
                  status: 500, 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              )
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
                  // Llamar a la función RPC para registrar el uso del cupón
                  const { data: registroData, error: registroError } = await supabase
                    .rpc('registrar_uso_cupon', {
                      p_cupon_id: cuponData.id,
                      p_usuario_id: orderData.user_id,
                      p_pedido_id: newOrder.id,
                      p_descuento_aplicado: orderData.descuento
                    })

                  if (registroError) {
                    console.error('Error registering coupon usage:', registroError)
                  } else {
                    console.log('Coupon usage registered successfully')
                  }
                }
              } catch (cuponRegisterError) {
                console.error('Error registering coupon usage:', cuponRegisterError)
                // No fallar el webhook por error en el cupón
              }
            }

          } else if (order) {
            // Si el pedido ya existe, actualizarlo con la información del pago
            const { data: updatedOrder, error: updateError } = await supabase
              .from('pedidos')
              .update({
                mercadopago_payment_id: paymentInfo.id?.toString(),
                mercadopago_status: paymentInfo.status || 'unknown',
                mercadopago_status_detail: paymentInfo.status_detail || '',
                mercadopago_payment_type: paymentInfo.payment_type_id || '',
                estado: paymentInfo.status === 'approved' ? 'completado' : 
                       paymentInfo.status === 'pending' ? 'pendiente' :
                       paymentInfo.status === 'rejected' ? 'cancelado' : order.estado
              })
              .eq('id', order.id)
              .select()
              .single()

            if (updateError) {
              console.error('Error updating order:', updateError)
              return new Response(
                JSON.stringify({ error: 'Error updating order', details: updateError.message }),
                { 
                  status: 500, 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              )
            }

            console.log('Order updated successfully:', {
              orderId: order.id,
              paymentStatus: paymentInfo.status,
              orderStatus: updatedOrder?.estado
            })
          } else {
            // No hay datos del pedido y no se encontró en la BD
            console.warn('Payment received but no order data available:', refId)
            return new Response(
              JSON.stringify({ received: true, message: 'Payment processed but order data not available' }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Enviar email de confirmación si el pago fue aprobado
          if (paymentInfo.status === 'approved' && order) {
            console.log('Payment approved - order completed:', order.id)

            // Enviar email de confirmación mediante Edge Function
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

                // Llamar a la función de emails
                const emailPayload = {
                  type: 'order_confirmation',
                  to: userData.email,
                  data: {
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
                  }
                }

                const emailResponse = await fetch(
                  `${Deno.env.get('SUPABASE_URL')}/functions/v1/emails`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
                    },
                    body: JSON.stringify(emailPayload)
                  }
                )

                if (!emailResponse.ok) {
                  const errorText = await emailResponse.text()
                  console.error('Error sending confirmation email:', errorText)
                } else {
                  console.log('Confirmation email sent successfully')
                }
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
        return new Response(
          JSON.stringify({ error: 'Error fetching payment details', paymentId }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      console.log('Non-payment webhook received:', type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
