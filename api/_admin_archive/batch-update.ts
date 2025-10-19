import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_KEY || '')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' })
  try {
    const payload = req.body // expected { updates: [{ id, visible?: boolean, metadata?: { hex?: string }}] }
    if (!payload || !Array.isArray(payload.updates)) return res.status(400).send({ error: 'Invalid payload' })

    // perform updates in a transaction-like fashion
    const updates = payload.updates.map((u: any) => {
      const row: any = {}
      if (typeof u.visible === 'boolean') row.visible = u.visible
      if (u.metadata) row.metadata = { ...(u.metadata || {}) }
      return { id: u.id, row }
    })

    // Use Promise.all but group into single request per item. For very large batches consider a server-side transaction.
    const results: any[] = []
    for (const it of updates) {
      const { id, row } = it
      const { error } = await supabaseAdmin.from('product_option_values').update(row).eq('id', id)
      if (error) throw error
      results.push({ id })
    }

    return res.status(200).json({ updated: results.length })
  } catch (err: any) {
    console.error('batch-update error', err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}
