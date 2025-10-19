import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function statsHandler(_req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
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
  } catch (err) {
    console.error('Error in admin/stats:', err)
    return res.status(500).json({ error: String(err) })
  }
}
