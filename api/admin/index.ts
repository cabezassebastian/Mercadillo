import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Single entrypoint for admin RPCs and CRUD to reduce serverless function count
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = (req.query.action as string) || (req.query.route as string) || ''
    // normalize
    const act = action.toLowerCase()

    // Top products
    if (act === 'top-products') {
      const limit = Number(req.query.limit || 5)
      const { data, error } = await supabase.rpc('get_top_selling_products', { limit_count: limit })
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data })
    }

    // Sales (day/week/month)
    if (act === 'sales') {
      const period = (req.query.period as string) || 'month'
      let rpcName = 'get_monthly_sales'
      let params: any = { months_back: 12 }
      if (period === 'day') {
        rpcName = 'get_daily_sales'
        params = { days_back: 7 }
      } else if (period === 'week') {
        rpcName = 'get_weekly_sales'
        params = { weeks_back: 4 }
      }
      const { data, error } = await supabase.rpc(rpcName, params)
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data })
    }

    // Metrics: conversion / low_stock
    if (act === 'metrics') {
      const sub = (req.query.sub as string) || (req.query.action as string) || ''
      if (sub === 'conversion') {
        const { data, error } = await supabase.rpc('get_conversion_rate')
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      if (sub === 'low_stock') {
        const threshold = Number(req.query.threshold || 5)
        const { data, error } = await supabase.rpc('get_low_stock_products', { threshold })
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      return res.status(400).json({ error: 'Invalid metrics action' })
    }

    // Stats
    if (act === 'stats') {
      const [{ count: productosCount }, { data: pedidosData }, { count: usuariosCount }] = await Promise.all([
        supabase.from('productos').select('id', { count: 'exact' }),
        supabase.from('pedidos').select('id, total, created_at, estado'),
        supabase.from('usuarios').select('id', { count: 'exact' })
      ])

      const pedidos = pedidosData || []
      const ingresosTotales = pedidos.reduce((sum: number, p: any) => (p.estado && p.estado !== 'cancelado') ? sum + (p.total || 0) : sum, 0)
      const hoy = new Date().toISOString().split('T')[0]
      const pedidosHoy = pedidos.filter((p: any) => p.created_at && p.created_at.startsWith(hoy)).length
      const inicioMes = new Date()
      inicioMes.setDate(1)
      const pedidosMes = pedidos.filter((p: any) => new Date(p.created_at) >= inicioMes).length

      return res.status(200).json({
        totalProductos: productosCount || 0,
        totalPedidos: (pedidosData || []).length || 0,
        totalUsuarios: usuariosCount || 0,
        ingresosTotales,
        pedidosHoy,
        pedidosMes,
        pedidos
      })
    }

    // Options and values for a product
    if (act === 'options') {
      const productId = req.query.productId as string
      const { data: opts, error: optsErr } = await supabase.from('product_options').select('*').eq('producto_id', productId)
      const { data: vals, error: valsErr } = await supabase.from('product_option_values').select('*').eq('producto_id', productId)
      if (optsErr || valsErr) return res.status(500).json({ error: optsErr || valsErr })
      return res.status(200).json({ options: opts || [], values: vals || [] })
    }

    // Variants for product
    if (act === 'variants') {
      const productId = req.query.productId as string
      const { data, error } = await supabase.from('product_variants').select('*').eq('producto_id', productId)
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data: data || [] })
    }

    // Product info
    if (act === 'product-info') {
      const id = req.query.id as string
      const { data, error } = await supabase.from('productos').select('id, precio').eq('id', id).single()
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data })
    }

    // Product images CRUD
    if (act === 'product-images') {
      if (req.method === 'GET') {
        const productId = req.query.productId as string
        const { data, error } = await supabase.from('producto_imagenes').select('*').eq('producto_id', productId).order('orden', { ascending: true })
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      if (req.method === 'POST') {
        const { producto_id, url, orden, es_principal, alt_text } = req.body
        const { data, error } = await supabase.from('producto_imagenes').insert([{ producto_id, url, orden, es_principal, alt_text }]).select().single()
        if (error) return res.status(500).json({ error })
        return res.status(201).json({ data })
      }
      if (req.method === 'PUT') {
        const { id, updates } = req.body
        const { data, error } = await supabase.from('producto_imagenes').update(updates).eq('id', id).select().single()
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      if (req.method === 'DELETE') {
        const id = req.query.id as string
        const { error } = await supabase.from('producto_imagenes').delete().eq('id', id)
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ ok: true })
      }
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Orders: GET list, PATCH updates
    if (act === 'orders') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('pedidos').select('*, usuarios(email, nombre, apellido)').order('created_at', { ascending: false })
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      if (req.method === 'PATCH' || req.method === 'PUT') {
        const { id, updates } = req.body || {}
        if (!id || !updates) return res.status(400).json({ error: 'Missing id or updates' })
        const { data, error } = await supabase.from('pedidos').update(updates).eq('id', id).single()
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      return res.status(405).json({ error: 'Method not allowed for orders' })
    }

    // Users: GET user by id
    if (act === 'users') {
      const id = req.query.id as string
      if (!id) return res.status(400).json({ error: 'Missing id' })
      const { data, error } = await supabase.from('usuarios').select('id, email, nombre, apellido').eq('id', id).single()
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data })
    }

    // Option and Option-values writes (simple wrapper)
    if (act === 'option' && req.method === 'POST') {
      const { product_id, name } = req.body
      const { data, error } = await supabase.from('product_options').insert([{ producto_id: product_id, name }]).select().single()
      if (error) return res.status(500).json({ error })
      return res.status(201).json({ data })
    }

    if (act === 'option-values') {
      if (req.method === 'POST') {
        const { option_id, value, metadata, visible } = req.body
        const { data, error } = await supabase.from('product_option_values').insert([{ option_id, value, metadata, visible }]).select().single()
        if (error) return res.status(500).json({ error })
        return res.status(201).json({ data })
      }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const { id, updates } = req.body
        const { data, error } = await supabase.from('product_option_values').update(updates).eq('id', id).select().single()
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      if (req.method === 'DELETE') {
        const id = req.query.id as string
        const { error } = await supabase.from('product_option_values').delete().eq('id', id)
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ ok: true })
      }
    }

    // Batch update option values (migrated from option-values/batch-update.ts)
    if (act === 'option-values-batch') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
      try {
        const payload = req.body // expected { updates: [{ id, visible?: boolean, metadata?: { hex?: string }}] }
        if (!payload || !Array.isArray(payload.updates)) return res.status(400).json({ error: 'Invalid payload' })

        const results: any[] = []
        for (const u of payload.updates) {
          const row: any = {}
          if (typeof u.visible === 'boolean') row.visible = u.visible
          if (u.metadata) row.metadata = { ...(u.metadata || {}) }
          const { error } = await supabase.from('product_option_values').update(row).eq('id', u.id)
          if (error) throw error
          results.push({ id: u.id })
        }

        return res.status(200).json({ updated: results.length })
      } catch (err: any) {
        console.error('option-values-batch error', err)
        return res.status(500).json({ error: err.message || String(err) })
      }
    }

    // Variants write wrapper
    if (act === 'variants-write') {
      if (req.method === 'POST') {
        const payload = req.body
        const { data, error } = await supabase.from('product_variants').insert(payload)
        if (error) return res.status(500).json({ error })
        return res.status(201).json({ data })
      }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const { id, updates } = req.body
        const { data, error } = await supabase.from('product_variants').update(updates).eq('id', id).select().single()
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      if (req.method === 'DELETE') {
        const id = req.query.id as string
        const { error } = await supabase.from('product_variants').delete().eq('id', id)
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ ok: true })
      }
    }

    return res.status(400).json({ error: 'Invalid admin action' })
  } catch (err) {
    console.error('Unexpected error in admin/index:', err)
    return res.status(500).json({ error: String(err) })
  }
}
