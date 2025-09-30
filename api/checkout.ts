import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items, total, nombre, email, direccion, telefono, usuario_id } = req.body
    
    // Obtener el usuario_id del header o del body
    const userId = req.headers['x-user-id'] as string || usuario_id
    
    if (!userId) {
      console.error('No user ID provided')
      return res.status(400).json({ error: 'User ID is required' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('No items provided')
      return res.status(400).json({ error: 'Items are required' })
    }

    console.log('Creating order for user:', userId)
    console.log('Items:', items)
    console.log('Total:', total)

    // Crear el pedido en la base de datos con estado pendiente
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([{
        usuario_id: userId,
        items,
        subtotal: parseFloat((total / 1.18).toFixed(2)),
        igv: parseFloat((total - (total / 1.18)).toFixed(2)),
        total,
        estado: 'pendiente',
        nombre_cliente: nombre,
        email_cliente: email,
        telefono_cliente: telefono,
        direccion_envio: direccion,
        metodo_pago: 'mercadopago'
      }])
      .select()
      .single()

    if (pedidoError) {
      console.error('Error creating order:', pedidoError)
      return res.status(500).json({ 
        error: 'Error creating order', 
        details: pedidoError.message 
      })
    }

    console.log('Order created successfully:', pedido.id)

    res.status(200).json({ 
      success: true,
      pedido_id: pedido.id,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Error in checkout:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


