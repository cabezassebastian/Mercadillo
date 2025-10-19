import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const productId = req.query.productId as string
    const { data: opts, error: optsErr } = await supabase.from('product_options').select('*').eq('producto_id', productId)
    const { data: vals, error: valsErr } = await supabase.from('product_option_values').select('*').eq('producto_id', productId)

    if (optsErr || valsErr) {
      console.error('Error fetching options/values:', optsErr || valsErr)
      return res.status(500).json({ error: optsErr || valsErr })
    }

    return res.status(200).json({ options: opts || [], values: vals || [] })
  } catch (err) {
    console.error('Unexpected error in admin/options:', err)
    return res.status(500).json({ error: String(err) })
  }
}
