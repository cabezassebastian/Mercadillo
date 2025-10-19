import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||'')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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
  } catch (err) {
    console.error('Error in admin/product-images:', err)
    return res.status(500).json({ error: String(err) })
  }
}
