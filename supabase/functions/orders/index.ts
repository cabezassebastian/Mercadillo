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

  try {
    // Get user ID from header
    const userId = req.headers.get('x-user-id')

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method === 'GET') {
      // Get user's orders
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return new Response(
          JSON.stringify({ error: 'Error fetching orders' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ pedidos }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      // Create new order
      const body = await req.json()
      const { items, subtotal, igv, total, direccion, metodo_pago } = body

      // Ensure items keep variant metadata
      const itemsToInsert = items.map((it: any) => ({
        producto_id: it.producto?.id || it.id || null,
        cantidad: it.cantidad,
        precio_unitario: it.producto?.precio || it.unit_price || 0,
        variant_id: it.producto?.variant_id || it.variant_id || null,
        variant_label: it.producto?.variant_label || it.variant_label || null,
        option_value_ids: it.producto?.option_value_ids || it.option_value_ids || null,
        variant_attributes: it.producto?.variant_attributes || it.variant_attributes || null,
        raw: it
      }))

      const { data: pedido, error: createError } = await supabase
        .from('pedidos')
        .insert([{
          usuario_id: userId,
          items: itemsToInsert,
          subtotal,
          igv,
          total,
          estado: 'pendiente',
          direccion_envio: direccion,
          metodo_pago: metodo_pago
        }])
        .select()
        .single()

      if (createError) {
        console.error('Error creating order:', createError)
        return new Response(
          JSON.stringify({ error: 'Error creating order' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ pedido }), 
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in orders function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
