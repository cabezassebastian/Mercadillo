import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    switch (req.method) {
      case 'GET':
        // Obtener pedidos del usuario
        const { data: pedidos, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('usuario_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching orders:', error)
          return res.status(500).json({ error: 'Error fetching orders' })
        }

        res.status(200).json({ pedidos })
        break

      case 'POST':
        // Crear nuevo pedido (para casos especiales)
        const { items, subtotal, igv, total, direccion, metodo_pago } = req.body

        const { data: pedido, error: createError } = await supabase
          .from('pedidos')
          .insert([{
            usuario_id: userId,
            items,
            subtotal,
            igv,
            total,
            estado: 'pendiente',
            direccion_envio: direccion,
            metodo_pago: metodo_pago
          }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating order:', createError)
          return res.status(500).json({ error: 'Error creating order' })
        }

        res.status(201).json({ pedido })
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in orders API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}


