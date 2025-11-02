import { serve } from "https://deno.land/std@0.201.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { items, total, nombre, email, direccion, telefono, usuario_id } = body
    
    // Get user ID from header or body
    const userId = req.headers.get('x-user-id') || usuario_id
    
    if (!userId) {
      console.error('No user ID provided')
      return new Response(
        JSON.stringify({ error: 'User ID is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('No items provided')
      return new Response(
        JSON.stringify({ error: 'Items are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating order for user:', userId)
    console.log('Items:', items)
    console.log('Total:', total)

    // Initialize Supabase with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create order in database with pending status
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([{
        usuario_id: userId,
        items,
        subtotal: parseFloat((total / 1.18).toFixed(2)),
        igv: parseFloat((total - (total / 1.18)).toFixed(2)),
        total,
        estado: 'pendiente',
        nombre_cliente: nombre,
        email_cliente: email,
        telefono_cliente: telefono,
        direccion_envio: direccion,
        metodo_pago: 'mercadopago'
      }])
      .select()
      .single()

    if (pedidoError) {
      console.error('Error creating order:', pedidoError)
      return new Response(
        JSON.stringify({ 
          error: 'Error creating order', 
          details: pedidoError.message 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Order created successfully:', pedido.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        pedido_id: pedido.id,
        message: 'Order created successfully'
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in checkout:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
