import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = req.query.id as string
    const { data, error } = await supabase.from('productos').select('id, precio').eq('id', id).single()
    if (error) {
      console.error('Error fetching product info:', error)
      return res.status(500).json({ error })
    }
    return res.status(200).json({ data })
  } catch (err) {
    console.error('Unexpected error in admin/product-info:', err)
    return res.status(500).json({ error: String(err) })
  }
}
