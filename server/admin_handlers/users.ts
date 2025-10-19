import { VercelRequest, VercelResponse } from '@vercel/node'
import { SupabaseClient } from '@supabase/supabase-js'

export async function usersHandler(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const id = req.query.id as string
    if (!id) return res.status(400).json({ error: 'Missing id' })

    const { data, error } = await supabase.from('usuarios').select('id, email, nombre, apellido').eq('id', id).single()
    if (error) {
      console.error('Error fetching user (admin/users):', error)
      return res.status(500).json({ error })
    }

    return res.status(200).json({ data })
  } catch (err) {
    console.error('Unexpected error in admin/users:', err)
    return res.status(500).json({ error: String(err) })
  }
}
