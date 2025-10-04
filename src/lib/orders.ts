import { supabase } from './supabaseClient'

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

export interface CreateOrder {
  usuario_id: string
  items: CartItem[]
  subtotal: number
  total: number
  direccion_envio: string
  metodo_pago: 'mercadopago' | 'transferencia' | 'efectivo'
  mercadopago_external_reference?: string
}

export interface Order {
  id: string
  usuario_id: string
  items: CartItem[]
  subtotal: number
  total: number
  estado: 'pendiente' | 'pagado' | 'procesando' | 'enviado' | 'entregado' | 'cancelado' | 'fallido'
  direccion_envio: string
  metodo_pago: string
  mercadopago_preference_id?: string
  mercadopago_payment_id?: string
  mercadopago_status?: string
  mercadopago_status_detail?: string
  mercadopago_payment_type?: string
  mercadopago_external_reference?: string
  fecha_pago?: string
  created_at: string
  updated_at: string
}

/**
 * Crear un nuevo pedido en Supabase
 */
export async function createOrder(orderData: CreateOrder): Promise<{ data: Order | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        ...orderData,
        estado: 'pendiente'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error creating order:', error)
    return { data: null, error: 'Error inesperado al crear el pedido' }
  }
}

/**
 * Actualizar un pedido con información de MercadoPago
 */
export async function updateOrderWithMercadoPago(
  orderId: string,
  mercadopagoData: {
    preference_id?: string
    payment_id?: string
    status?: string
    status_detail?: string
    payment_type?: string
  }
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const updateData: any = {}
    
    if (mercadopagoData.preference_id) {
      updateData.mercadopago_preference_id = mercadopagoData.preference_id
    }
    
    if (mercadopagoData.payment_id) {
      updateData.mercadopago_payment_id = mercadopagoData.payment_id
    }
    
    if (mercadopagoData.status) {
      updateData.mercadopago_status = mercadopagoData.status
    }
    
    if (mercadopagoData.status_detail) {
      updateData.mercadopago_status_detail = mercadopagoData.status_detail
    }
    
    if (mercadopagoData.payment_type) {
      updateData.mercadopago_payment_type = mercadopagoData.payment_type
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating order with MercadoPago data:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error updating order:', error)
    return { data: null, error: 'Error inesperado al actualizar el pedido' }
  }
}

/**
 * Buscar pedido por external_reference de MercadoPago
 */
export async function findOrderByExternalReference(
  externalReference: string
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('mercadopago_external_reference', externalReference)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Pedido no encontrado' }
      }
      console.error('Error finding order by external reference:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error finding order:', error)
    return { data: null, error: 'Error inesperado al buscar el pedido' }
  }
}

/**
 * Buscar pedido por preference_id de MercadoPago
 */
export async function findOrderByPreferenceId(
  preferenceId: string
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('mercadopago_preference_id', preferenceId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Pedido no encontrado' }
      }
      console.error('Error finding order by preference ID:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error finding order:', error)
    return { data: null, error: 'Error inesperado al buscar el pedido' }
  }
}

/**
 * Obtener pedidos de un usuario
 */
export async function getUserOrders(
  userId: string,
  limit: number = 50
): Promise<{ data: Order[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user orders:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching orders:', error)
    return { data: null, error: 'Error inesperado al obtener los pedidos' }
  }
}

/**
 * Verificar si un usuario compró un producto específico
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<{ purchased: boolean; pedido_id?: string; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('id, items')
      .eq('usuario_id', userId)
      .eq('estado', 'entregado')

    if (error) {
      console.error('Error checking user purchases:', error)
      return { purchased: false, error: error.message }
    }

    // Buscar el producto en los items de cada pedido
    for (const pedido of data) {
      const items = Array.isArray(pedido.items) ? pedido.items : []
      const hasProduct = items.some((item: any) => item.id === productId)
      
      if (hasProduct) {
        return { purchased: true, pedido_id: pedido.id, error: null }
      }
    }

    return { purchased: false, error: null }
  } catch (error) {
    console.error('Unexpected error checking purchases:', error)
    return { purchased: false, error: 'Error inesperado al verificar compras' }
  }
}

/**
 * Generar external_reference único para MercadoPago
 */
export function generateExternalReference(): string {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calcular totales del pedido
 */
export function calculateOrderTotals(items: CartItem[]): {
  subtotal: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}