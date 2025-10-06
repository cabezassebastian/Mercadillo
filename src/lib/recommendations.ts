import { supabase } from './supabaseClient'

// Minimal product shape returned to UI (use any to avoid strict type dependency)
type RecProduct = {
  id: string
  nombre?: string
  precio?: number
  slug?: string
  imagenes?: any
  rating_promedio?: number
}

/**
 * Productos relacionados: misma categoría y rango de precio ±20%
 */
export const relatedByCategoryAndPrice = async (productId: string, limit = 6): Promise<RecProduct[]> => {
  // Intentar RPC primero
  try {
    const { data, error } = await supabase.rpc('get_related_by_category_price', { p_product_id: productId, p_limit: limit })
    if (!error && data && Array.isArray(data)) return data as RecProduct[]
    // If RPC returned an error status-like object, log at debug level and continue to fallback
    if (error) {
      // don't spam console in production, only debug
      if (import.meta.env.DEV) console.debug('RPC get_related_by_category_price error:', error)
    }
  } catch (err) {
    // ignore and fallback
  }

  // Fallback client-side
  const { data: baseProduct, error: baseErr } = await supabase
    .from('productos')
    .select('id, categoria_id, precio')
    .eq('id', productId)
    .single()

  if (baseErr || !baseProduct) {
    if (import.meta.env.DEV) console.debug('relatedByCategoryAndPrice base product fetch error:', baseErr)
    return []
  }

  const minPrice = Number(baseProduct.precio) * 0.8
  const maxPrice = Number(baseProduct.precio) * 1.2

  const { data, error: listErr } = await supabase
    .from('productos')
    .select('id, nombre, precio, slug, imagenes, rating_promedio')
    .eq('categoria_id', baseProduct.categoria_id)
    .gte('precio', minPrice)
    .lte('precio', maxPrice)
    .neq('id', productId)
    .order('rating_promedio', { ascending: false })
    .limit(limit)

  if (listErr) {
    if (import.meta.env.DEV) console.debug('relatedByCategoryAndPrice products list error:', listErr)
    return []
  }

  return (data || []) as RecProduct[]
}

/**
 * Productos "también comprados": encontrar pedidos que incluyan el producto y agregar otros productos frecuentes
 */
export const alsoBought = async (productId: string, limit = 6): Promise<RecProduct[]> => {
  // Intentar RPC primero
  try {
    const { data, error } = await supabase.rpc('get_also_bought_products', { p_product_id: productId, p_limit: limit })
    if (!error && data && Array.isArray(data) && data.length > 0) return data as RecProduct[]
  } catch (err) {
    // ignore and fallback
  }

  // Fallback client-side (existing logic)
  const { data: orders, error: ordersErr } = await supabase
    .from('pedidos_productos')
    .select('pedido_id')
    .eq('producto_id', productId)

  if (ordersErr) {
    if (import.meta.env.DEV) console.debug('alsoBought pedidos_productos fetch error:', ordersErr)
    return topSellers('month', limit)
  }

  const pedidoIds = (orders || []).map((o: any) => o.pedido_id)
  if (pedidoIds.length === 0) {
    return topSellers('month', limit)
  }

  const { data: items, error: itemsErr } = await supabase
    .from('pedidos_productos')
    .select('producto_id')
    .in('pedido_id', pedidoIds)

  if (itemsErr) {
    if (import.meta.env.DEV) console.debug('alsoBought pedidos_productos items fetch error:', itemsErr)
    return topSellers('month', limit)
  }

  const counts: Record<string, number> = {}
  ;(items || []).forEach((it: any) => {
    const pid = it.producto_id
    if (!pid || pid === productId) return
    counts[pid] = (counts[pid] || 0) + 1
  })

  const sortedIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (sortedIds.length === 0) return topSellers('month', limit)

  const { data: products, error: productsErr } = await supabase
    .from('productos')
    .select('id, nombre, precio, slug, imagenes, rating_promedio')
    .in('id', sortedIds)

  if (productsErr) {
    if (import.meta.env.DEV) console.debug('alsoBought products fetch error:', productsErr)
    return []
  }

  return (products || []) as RecProduct[]
}

/**
 * Top sellers (por periodo): 'week' | 'month' | 'all'
 */
export const topSellers = async (period: 'week' | 'month' | 'all' = 'week', limit = 6): Promise<RecProduct[]> => {
  // Intentar RPC get_top_selling_products
  try {
    const { data, error } = await supabase.rpc('get_top_selling_products', { p_period: period, p_limit: limit })
    if (!error && data && Array.isArray(data)) return data as RecProduct[]
  } catch (err) {
    // fallback to client-side
  }

  // Fallback client-side
  let since: string | null = null
  if (period === 'week') since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  if (period === 'month') since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const q = supabase.from('pedidos_productos').select('producto_id, created_at').neq('producto_id', null)
  const res = since ? await q.gt('created_at', since).limit(10000) : await q.limit(10000)

  if ((res as any).error) {
    if (import.meta.env.DEV) console.debug('topSellers pedidos_productos fetch error:', (res as any).error)
    return []
  }

  const counts: Record<string, number> = {}
  ;(res.data || []).forEach((r: any) => {
    const pid = r.producto_id
    if (!pid) return
    counts[pid] = (counts[pid] || 0) + 1
  })

  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (topIds.length === 0) return []

  const { data: products } = await supabase
    .from('productos')
    .select('id, nombre, precio, slug, imagenes, rating_promedio')
    .in('id', topIds)

  return (products || []) as RecProduct[]
}

export default {
  relatedByCategoryAndPrice,
  alsoBought,
  topSellers
}
