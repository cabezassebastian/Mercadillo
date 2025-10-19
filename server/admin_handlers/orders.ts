import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function ordersHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, usuarios(email, nombre, apellido)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders (admin/orders):', error)
        return res.status(500).json({ error })
      }

      return res.status(200).json({ data })
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { id, updates } = req.body || {}
      if (!id || !updates) return res.status(400).json({ error: 'Missing id or updates' })

      const { data, error } = await supabase.from('pedidos').update(updates).eq('id', id).single()
      if (error) {
        console.error('Error updating order (admin/orders):', error)
        return res.status(500).json({ error })
      }

      return res.status(200).json({ data })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Unexpected error in admin/orders:', err)
    return res.status(500).json({ error: String(err) })
  }
}
