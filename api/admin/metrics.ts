import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = req.query.action as string

    if (action === 'conversion') {
      const { data, error } = await supabase.rpc('get_conversion_rate')
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data })
    }

    if (action === 'low_stock') {
      const threshold = Number(req.query.threshold || 5)
      const { data, error } = await supabase.rpc('get_low_stock_products', { threshold })
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (err) {
    console.error('Unexpected error in admin/metrics:', err)
    return res.status(500).json({ error: String(err) })
  }
}
