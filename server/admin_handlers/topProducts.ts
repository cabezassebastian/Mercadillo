import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function topProductsHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const limit = Number(req.query.limit || 5)
    const { data, error } = await supabase.rpc('get_top_selling_products', { limit_count: limit })
    if (error) {
      console.error('Error in admin/top-products RPC:', error)
      return res.status(500).json({ error })
    }
    return res.status(200).json({ data })
  } catch (err) {
    console.error('Unexpected error in admin/top-products:', err)
    return res.status(500).json({ error: String(err) })
  }
}
