import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function salesHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const period = (req.query.period as string) || 'month'
    let rpcName = 'get_monthly_sales'
    let params: any = { months_back: 12 }
    if (period === 'day') {
      rpcName = 'get_daily_sales'
      params = { days_back: 7 }
    } else if (period === 'week') {
      rpcName = 'get_weekly_sales'
      params = { weeks_back: 4 }
    }
    const { data, error } = await supabase.rpc(rpcName, params)
    if (error) {
      console.error('Error in admin/sales RPC:', error)
      return res.status(500).json({ error })
    }
    return res.status(200).json({ data })
  } catch (err) {
    console.error('Unexpected error in admin/sales:', err)
    return res.status(500).json({ error: String(err) })
  }
}
