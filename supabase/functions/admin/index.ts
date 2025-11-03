import { serve } from "https://deno.land/std@0.201.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

/*
  Admin dispatcher Edge Function
  
  - Supports actions (via query param `action`):
      top-products, sales, metrics, stats, product-images, orders, users,
      options, variants, option-values, option-values-batch,
      create-option, delete-option, create-option-value, delete-option-value,
      update-option-value-visibility, update-variant, delete-variant,
      generate-variants, get-variants
  - Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from environment
  - Protected with ADMIN_SECRET header for security
*/

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const ADMIN_SECRET = Deno.env.get('ADMIN_SECRET') || ''

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
}

// Allowed pedido estados (must match DB CHECK constraint)
const ALLOWED_PEDIDOS_ESTADOS = ['pendiente', 'pagado', 'procesando', 'enviado', 'entregado', 'cancelado']

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = (url.searchParams.get('action') || url.searchParams.get('route') || '').toLowerCase()

    // Security check - require admin secret
    const incomingSecret = req.headers.get('x-admin-secret') || ''
    if (ADMIN_SECRET && incomingSecret !== ADMIN_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }), 
        { status: 403, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    // Top products
    if (action === 'top-products') {
      const limit = Number(url.searchParams.get('limit') || 5)
      const { data, error } = await supabase.rpc('get_top_selling_products', { limit_count: limit })
      if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Sales (day/week/month)
    if (action === 'sales') {
      const period = (url.searchParams.get('period') || 'month')
      let rpcName = 'get_monthly_sales'
      let params: any = { months_back: 12 }
      if (period === 'day') { rpcName = 'get_daily_sales'; params = { days_back: 7 } }
      else if (period === 'week') { rpcName = 'get_weekly_sales'; params = { weeks_back: 4 } }
      const { data, error } = await supabase.rpc(rpcName, params)
      if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Metrics: conversion / low_stock
    if (action === 'metrics') {
      const sub = (url.searchParams.get('sub') || url.searchParams.get('metric') || '').toLowerCase()
      if (sub === 'conversion' || url.searchParams.get('action') === 'conversion') {
        const { data, error } = await supabase.rpc('get_conversion_rate')
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      if (sub === 'low_stock' || url.searchParams.get('action') === 'low_stock') {
        const threshold = Number(url.searchParams.get('threshold') || 5)
        const { data, error } = await supabase.rpc('get_low_stock_products', { threshold })
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      return new Response(JSON.stringify({ error: 'Invalid metrics action' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Stats
    if (action === 'stats') {
      const [{ count: productosCount }, { data: pedidosData }, { count: usuariosCount }] = await Promise.all([
        supabase.from('productos').select('id', { count: 'exact' }),
        supabase.from('pedidos').select('id, total, created_at, estado'),
        supabase.from('usuarios').select('id', { count: 'exact' })
      ])
      const pedidos = pedidosData || []
      const ingresosTotales = pedidos.reduce((sum: number, p: any) => (p.estado && p.estado !== 'cancelado') ? sum + (p.total || 0) : sum, 0)
      const hoy = new Date().toISOString().split('T')[0]
      const pedidosHoy = pedidos.filter((p: any) => p.created_at && p.created_at.startsWith(hoy)).length
      const inicioMes = new Date(); inicioMes.setDate(1)
      const pedidosMes = pedidos.filter((p: any) => new Date(p.created_at) >= inicioMes).length
      return new Response(JSON.stringify({ totalProductos: productosCount || 0, totalPedidos: (pedidosData || []).length || 0, totalUsuarios: usuariosCount || 0, ingresosTotales, pedidosHoy, pedidosMes, pedidos }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Product images CRUD
    if (action === 'product-images') {
      if (req.method === 'GET') {
        const productId = url.searchParams.get('productId') || ''
        const { data, error } = await supabase.from('producto_imagenes').select('*').eq('producto_id', productId).order('orden', { ascending: true })
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      if (req.method === 'POST') {
        const body = await req.json().catch(() => null)
        const { producto_id, url: urlImg, orden, es_principal, alt_text } = body || {}
        const { data, error } = await supabase.from('producto_imagenes').insert([{ producto_id, url: urlImg, orden, es_principal, alt_text }]).select().single()
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const body = await req.json().catch(() => null)
        const { id, updates } = body || {}
        const { data, error } = await supabase.from('producto_imagenes').update(updates).eq('id', id).select().single()
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      if (req.method === 'DELETE') {
        const id = url.searchParams.get('id') || ''
        const { error } = await supabase.from('producto_imagenes').delete().eq('id', id)
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
    }

    // Orders: GET list, PATCH updates
    if (action === 'orders') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('pedidos').select('*, usuarios(email, nombre, apellido)').order('created_at', { ascending: false })
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      if (req.method === 'PATCH' || req.method === 'PUT') {
        const body = await req.json().catch(() => null)
        const { id, updates } = body || {}
        if (!id || !updates) return new Response(JSON.stringify({ error: 'Missing id or updates' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        // Validate `estado` if present to avoid DB CHECK constraint violations
        if (Object.prototype.hasOwnProperty.call(updates, 'estado')) {
          const rawEstado = updates.estado == null ? '' : String(updates.estado)
          const normalized = rawEstado.toLowerCase()
          if (!ALLOWED_PEDIDOS_ESTADOS.includes(normalized)) {
            console.warn('Rejected invalid pedido estado:', rawEstado)
            return new Response(JSON.stringify({ error: 'Invalid pedido estado', allowed: ALLOWED_PEDIDOS_ESTADOS }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
          }
          // normalize value so DB receives canonical lowercase values
          updates.estado = normalized
        }
        const { data, error } = await supabase.from('pedidos').update(updates).eq('id', id).select().single()
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
    }

    // Users: GET user by id
    if (action === 'users') {
      if (req.method === 'GET') {
        const userId = url.searchParams.get('id') || url.searchParams.get('userId') || ''
        if (!userId) return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        const { data, error } = await supabase.from('usuarios').select('*').eq('id', userId).single()
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
    }

    // Options for a product
    if (action === 'options') {
      if (req.method === 'GET') {
        const productId = url.searchParams.get('productId') || url.searchParams.get('product_id') || ''
        if (!productId) return new Response(JSON.stringify({ error: 'Product ID required' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        const { data, error } = await supabase.from('product_options').select('*, product_option_values(*)').eq('producto_id', productId).order('position', { ascending: true })
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      if (req.method === 'POST') {
        const body = await req.json().catch(() => null)
        const { product_id, name } = body || {}
        const { data, error } = await supabase.from('product_options').insert([{ producto_id: product_id, name }]).select().single()
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
    }

    // Option values CRUD
    if (action === 'option-values') {
      if (req.method === 'POST') {
        const body = await req.json().catch(() => null)
        const { option_id, value, metadata, visible } = body || {}
        const { data, error } = await supabase.from('product_option_values').insert([{ option_id, value, metadata, visible }]).select().single()
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const body = await req.json().catch(() => null)
        const { id, updates } = body || {}
        const { data, error } = await supabase.from('product_option_values').update(updates).eq('id', id).select().single()
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
      if (req.method === 'DELETE') {
        const id = url.searchParams.get('id') || ''
        const { error } = await supabase.from('product_option_values').delete().eq('id', id)
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
    }

    // Variants for product
    if (action === 'variants') {
      if (req.method === 'GET') {
        const productId = url.searchParams.get('productId') || url.searchParams.get('product_id') || ''
        if (!productId) return new Response(JSON.stringify({ error: 'Product ID required' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        const { data, error } = await supabase.from('product_variants').select('*').eq('product_id', productId)
        if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
        return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      }
    }

    // ============================================
    // NUEVOS ENDPOINTS DE VARIANTES (Sistema mejorado)
    // ============================================

    // Create option
    if (action === 'create-option' && req.method === 'POST') {
      const body = await req.json().catch(() => null)
      const { product_id, name, position } = body || {}
      const { data, error } = await supabase
        .from('product_options')
        .insert([{ product_id, name, position: position || 0 }])
        .select()
        .single()
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Delete option
    if (action === 'delete-option' && req.method === 'DELETE') {
      const body = await req.json().catch(() => null)
      const { option_id } = body || {}
      const { error } = await supabase
        .from('product_options')
        .delete()
        .eq('id', option_id)
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Create option value
    if (action === 'create-option-value' && req.method === 'POST') {
      const body = await req.json().catch(() => null)
      const { option_id, value, metadata, position, visible } = body || {}
      const { data, error } = await supabase
        .from('product_option_values')
        .insert([{ option_id, value, metadata, position: position || 0, visible: visible !== false }])
        .select()
        .single()
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Delete option value
    if (action === 'delete-option-value' && req.method === 'DELETE') {
      const body = await req.json().catch(() => null)
      const { value_id } = body || {}
      const { error } = await supabase
        .from('product_option_values')
        .delete()
        .eq('id', value_id)
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Update option value visibility
    if (action === 'update-option-value-visibility' && req.method === 'PATCH') {
      const body = await req.json().catch(() => null)
      const { value_id, visible } = body || {}
      const { error } = await supabase
        .from('product_option_values')
        .update({ visible })
        .eq('id', value_id)
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Update variant
    if (action === 'update-variant' && req.method === 'PATCH') {
      const body = await req.json().catch(() => null)
      const { variant_id, field, value } = body || {}
      const { error } = await supabase
        .from('product_variants')
        .update({ [field]: value })
        .eq('id', variant_id)
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Delete variant
    if (action === 'delete-variant' && req.method === 'DELETE') {
      const body = await req.json().catch(() => null)
      const { variant_id } = body || {}
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variant_id)
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Generate variants
    if (action === 'generate-variants' && req.method === 'POST') {
      const body = await req.json().catch(() => null)
      const { product_id, options, base_price } = body || {}
      
      // Build all combinations
      const combinations: string[][] = [[]]
      
      for (const option of options || []) {
        if (!option.values || option.values.length === 0) continue
        
        const newCombinations: string[][] = []
        for (const combo of combinations) {
          for (const valueId of option.values) {
            newCombinations.push([...combo, valueId])
          }
        }
        combinations.length = 0
        combinations.push(...newCombinations)
      }
      
      // Get existing variants to avoid duplicates
      const { data: existing } = await supabase
        .from('product_variants')
        .select('option_value_ids')
        .eq('product_id', product_id)
      
      const existingCombos = new Set(
        (existing || []).map((v: any) => JSON.stringify(v.option_value_ids.sort()))
      )
      
      // Build new variants only
      const newVariants = combinations
        .filter(combo => !existingCombos.has(JSON.stringify([...combo].sort())))
        .map(combo => ({
          product_id,
          option_value_ids: combo,
          price: base_price,
          stock: null,
          is_active: true,
          attributes: {}
        }))
      
      if (newVariants.length === 0) {
        return new Response(
          JSON.stringify({ data: [], count: 0, message: 'No new variants to create' }), 
          { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
        )
      }
      
      const { data, error } = await supabase
        .from('product_variants')
        .insert(newVariants)
        .select()
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ data, count: data?.length || 0 }), { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Get variants with details (for loading variants view)
    if (action === 'get-variants' && req.method === 'GET') {
      const product_id = url.searchParams.get('product_id') || url.searchParams.get('productId') || ''
      if (!product_id) return new Response(JSON.stringify({ error: 'product_id is required' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      
      const { data, error } = await supabase
        .from('variantes_con_detalles')
        .select('*')
        .eq('product_id', product_id)
        .order('variante_nombre')
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
      return new Response(JSON.stringify({ data: data || [] }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Invalid admin action' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  } catch (err) {
    console.error('Unexpected error in admin function:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }
})
