import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function variantsHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const productId = req.query.productId as string
    const { data, error } = await supabase.from('product_variants').select('*').eq('producto_id', productId)
    if (error) {
      console.error('Error fetching variants:', error)
      return res.status(500).json({ error })
    }
    return res.status(200).json({ data: data || [] })
  } catch (err) {
    console.error('Unexpected error in admin/variants:', err)
    return res.status(500).json({ error: String(err) })
  }
}
