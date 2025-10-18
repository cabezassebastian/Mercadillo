import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Product id required' })

  try {
    const productId = Array.isArray(id) ? id[0] : String(id)

    const { data: product, error: pErr } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productId)
      .single()

    if (pErr || !product) return res.status(404).json({ error: 'Product not found' })

    // fetch options
    const { data: options } = await supabase
      .from('product_options')
      .select('id, name')
      .eq('product_id', productId)
      .order('position', { ascending: true })

    // fetch values for each option
    const optionsWithValues = [] as any[]
    if (options && options.length) {
      for (const opt of options) {
        const { data: values } = await supabase
          .from('product_option_values')
          .select('id, value, metadata')
          .eq('option_id', opt.id)
          .order('position', { ascending: true })
        optionsWithValues.push({ ...opt, values: values || [] })
      }
    }

    // fetch variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)

    return res.status(200).json({ product, options: optionsWithValues, variants: variants || [] })
  } catch (err: any) {
    console.error('product fetch error', err)
    return res.status(500).json({ error: String(err) })
  }
}
