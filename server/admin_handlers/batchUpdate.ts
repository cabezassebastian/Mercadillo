import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function batchUpdateHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const payload = req.body // expected { updates: [{ id, visible?: boolean, metadata?: { hex?: string }}] }
    if (!payload || !Array.isArray(payload.updates)) return res.status(400).json({ error: 'Invalid payload' })

    const updates = payload.updates.map((u: any) => {
      const row: any = {}
      if (typeof u.visible === 'boolean') row.visible = u.visible
      if (u.metadata) row.metadata = { ...(u.metadata || {}) }
      return { id: u.id, row }
    })

    const results: any[] = []
    for (const it of updates) {
      const { id, row } = it
      const { error } = await supabase.from('product_option_values').update(row).eq('id', id)
      if (error) throw error
      results.push({ id })
    }

    return res.status(200).json({ updated: results.length })
  } catch (err: any) {
    console.error('batch-update error', err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}
