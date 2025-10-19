import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function variantsWriteHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    if (req.method === 'POST') {
      const { inserts } = req.body
      const { data, error } = await supabase.from('product_variants').insert(inserts)
      if (error) return res.status(500).json({ error })
      return res.status(201).json({ data })
    }

    if (req.method === 'PUT') {
      const { id, updates } = req.body
      const { data, error } = await supabase.from('product_variants').update(updates).eq('id', id).select().single()
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data })
    }

    if (req.method === 'PATCH') {
      const { updates } = req.body
      const results: any[] = []
      for (const u of updates) {
        const { data, error } = await supabase.from('product_variants').update(u.updates).eq('id', u.id)
        results.push({ data, error })
      }
      return res.status(200).json({ results })
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string
      const { error } = await supabase.from('product_variants').delete().eq('id', id)
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Error in admin/variants-write:', err)
    return res.status(500).json({ error: String(err) })
  }
}
