import { serve } from "https://deno.land/std@0.201.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const productId = pathParts[pathParts.length - 1] // Last part is the ID

    if (!productId || productId === 'products') {
      return new Response(
        JSON.stringify({ error: 'Product id required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try to fetch product by ID first
    let { data: product, error: pErr } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productId)
      .maybeSingle()

    // If not found by ID, try by slug
    if (!product && productId) {
      const result = await supabase
        .from('productos')
        .select('*')
        .eq('slug', productId)
        .maybeSingle()
      
      product = result.data
      pErr = result.error
    }

    if (pErr || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch options
    const { data: options } = await supabase
      .from('product_options')
      .select('id, name')
      .eq('product_id', productId)
      .order('position', { ascending: true })

    // Fetch values for each option
    const optionsWithValues = []
    if (options && options.length) {
      for (const opt of options) {
        const { data: values } = await supabase
          .from('product_option_values')
          .select('id, value, metadata')
          .eq('option_id', opt.id)
          .order('position', { ascending: true })
        optionsWithValues.push({ ...opt, values: values || [] })
      }
    }

    // Fetch variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)

    return new Response(
      JSON.stringify({ 
        product, 
        options: optionsWithValues, 
        variants: variants || [] 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (err) {
    console.error('Product fetch error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
