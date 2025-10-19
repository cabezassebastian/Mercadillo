import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function optionsHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
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
