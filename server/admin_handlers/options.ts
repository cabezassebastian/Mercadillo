import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function optionsHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const productId = req.query.productId as string
    
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' })
    }

    const { data: opts, error: optsErr } = await supabase
      .from('product_options')
      .select('*')
      .eq('product_id', productId)
      .order('position')
    
    if (optsErr) {
      console.error('Error fetching options:', optsErr)
      return res.status(500).json({ error: optsErr })
    }

    // Get values for all options of this product
    const optionIds = (opts || []).map(o => o.id)
    let vals: any[] = []
    
    if (optionIds.length > 0) {
      const { data: valsData, error: valsErr } = await supabase
        .from('product_option_values')
        .select('*')
        .in('option_id', optionIds)
        .order('position')
      
      if (valsErr) {
        console.error('Error fetching values:', valsErr)
        return res.status(500).json({ error: valsErr })
      }
      
      vals = valsData || []
    }

    return res.status(200).json({ options: opts || [], values: vals })
  } catch (err) {
    console.error('Unexpected error in admin/options:', err)
    return res.status(500).json({ error: String(err) })
  }
}
