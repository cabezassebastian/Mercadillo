import { supabase } from './supabaseClient'

// Tipos para Lista de Deseos
export interface WishlistItem {
  id: string
  usuario_id: string
  producto_id: string
  created_at: string
  producto?: {
    id: string
    nombre: string
    precio: number
    imagen: string
    stock: number
  }
}

// Tipos para Historial de Navegación
export interface NavigationHistoryItem {
  id: string
  usuario_id: string
  producto_id: string
  created_at: string
  updated_at: string
  producto?: {
    id: string
    nombre: string
    precio: number
    imagen: string
  }
}

// Tipos para Direcciones
export interface UserAddress {
  id: string
  usuario_id: string
  nombre: string
  direccion_completa: string
  distrito?: string
  provincia: string
  departamento: string
  codigo_postal?: string
  referencia?: string
  telefono_contacto?: string
  es_predeterminada: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserAddress {
  nombre: string
  direccion_completa: string
  distrito?: string
  provincia?: string
  departamento?: string
  codigo_postal?: string
  referencia?: string
  telefono_contacto?: string
  es_predeterminada?: boolean
}

// ==================== LISTA DE DESEOS ====================

/**
 * Obtener lista de deseos del usuario
 */
export async function getUserWishlist(userId: string): Promise<{ data: WishlistItem[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('lista_deseos')
      .select(`
        *,
        producto:productos(id, nombre, precio, imagen, stock)
      `)
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wishlist:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching wishlist:', error)
    return { data: null, error: 'Error inesperado al obtener lista de deseos' }
  }
}

/**
 * Agregar producto a lista de deseos
 */
export async function addToWishlist(userId: string, productId: string): Promise<{ data: WishlistItem | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('lista_deseos')
      .insert([{ usuario_id: userId, producto_id: productId }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Duplicate key error
        return { data: null, error: 'El producto ya está en tu lista de deseos' }
      }
      console.error('Error adding to wishlist:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error adding to wishlist:', error)
    return { data: null, error: 'Error inesperado al agregar a lista de deseos' }
  }
}

/**
 * Remover producto de lista de deseos
 */
export async function removeFromWishlist(userId: string, productId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('lista_deseos')
      .delete()
      .eq('usuario_id', userId)
      .eq('producto_id', productId)

    if (error) {
      console.error('Error removing from wishlist:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error removing from wishlist:', error)
    return { success: false, error: 'Error inesperado al remover de lista de deseos' }
  }
}

/**
 * Verificar si un producto está en la lista de deseos
 */
export async function isInWishlist(userId: string, productId: string): Promise<{ isInWishlist: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('lista_deseos')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return { isInWishlist: false, error: null }
      }
      console.error('Error checking wishlist:', error)
      return { isInWishlist: false, error: error.message }
    }

    return { isInWishlist: !!data, error: null }
  } catch (error) {
    console.error('Unexpected error checking wishlist:', error)
    return { isInWishlist: false, error: 'Error inesperado al verificar lista de deseos' }
  }
}

// ==================== HISTORIAL DE NAVEGACIÓN ====================

/**
 * Obtener historial de navegación del usuario
 */
export async function getUserNavigationHistory(userId: string, limit: number = 20): Promise<{ data: NavigationHistoryItem[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('historial_navegacion')
      .select(`
        *,
        producto:productos(id, nombre, precio, imagen)
      `)
      .eq('usuario_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching navigation history:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching navigation history:', error)
    return { data: null, error: 'Error inesperado al obtener historial' }
  }
}

/**
 * Agregar producto al historial de navegación
 */
export async function addToNavigationHistory(userId: string, productId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Llamando RPC actualizar_historial_navegacion con:', { userId, productId })
    
    const { data, error } = await supabase.rpc('actualizar_historial_navegacion', {
      p_usuario_id: userId,
      p_producto_id: productId
    })

    if (error) {
      console.error('Error RPC al agregar al historial de navegación:', error)
      console.log('Intentando método alternativo con upsert directo...')
      
      // Método alternativo: usar upsert directo
      return await addToNavigationHistoryDirect(userId, productId)
    }

    console.log('RPC ejecutado exitosamente, resultado:', data)
    return { success: true, error: null }
  } catch (error) {
    console.error('Error inesperado al agregar al historial de navegación:', error)
    console.log('Intentando método alternativo con upsert directo...')
    
    // Método alternativo en caso de error
    return await addToNavigationHistoryDirect(userId, productId)
  }
}

/**
 * Método alternativo para agregar al historial usando upsert directo
 */
async function addToNavigationHistoryDirect(userId: string, productId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Usando método directo para historial:', { userId, productId })
    
    // Intentar insertar, si ya existe actualizamos
    const { error: insertError } = await supabase
      .from('historial_navegacion')
      .upsert({
        usuario_id: userId,
        producto_id: productId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'usuario_id,producto_id'
      })

    if (insertError) {
      console.error('Error en upsert directo:', insertError)
      return { success: false, error: insertError.message }
    }

    console.log('Historial actualizado exitosamente con método directo')
    return { success: true, error: null }
  } catch (error) {
    console.error('Error inesperado en método directo:', error)
    return { success: false, error: 'Error inesperado al actualizar historial con método directo' }
  }
}

/**
 * Limpiar historial de navegación del usuario
 */
export async function clearNavigationHistory(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('historial_navegacion')
      .delete()
      .eq('usuario_id', userId)

    if (error) {
      console.error('Error clearing navigation history:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error clearing navigation history:', error)
    return { success: false, error: 'Error inesperado al limpiar historial' }
  }
}

// ==================== DIRECCIONES ====================

/**
 * Obtener direcciones del usuario
 */
export async function getUserAddresses(userId: string): Promise<{ data: UserAddress[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('direcciones_usuario')
      .select('*')
      .eq('usuario_id', userId)
      .order('es_predeterminada', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user addresses:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching addresses:', error)
    return { data: null, error: 'Error inesperado al obtener direcciones' }
  }
}

/**
 * Crear nueva dirección
 */
export async function createUserAddress(userId: string, addressData: CreateUserAddress): Promise<{ data: UserAddress | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('direcciones_usuario')
      .insert([{
        usuario_id: userId,
        ...addressData,
        provincia: addressData.provincia || 'Lima',
        departamento: addressData.departamento || 'Lima'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error creating address:', error)
    return { data: null, error: 'Error inesperado al crear dirección' }
  }
}

/**
 * Actualizar dirección
 */
export async function updateUserAddress(addressId: string, addressData: Partial<CreateUserAddress>): Promise<{ data: UserAddress | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('direcciones_usuario')
      .update(addressData)
      .eq('id', addressId)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error updating address:', error)
    return { data: null, error: 'Error inesperado al actualizar dirección' }
  }
}

/**
 * Eliminar dirección
 */
export async function deleteUserAddress(addressId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('direcciones_usuario')
      .delete()
      .eq('id', addressId)

    if (error) {
      console.error('Error deleting address:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error deleting address:', error)
    return { success: false, error: 'Error inesperado al eliminar dirección' }
  }
}

/**
 * Establecer dirección como predeterminada
 */
export async function setDefaultAddress(addressId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('direcciones_usuario')
      .update({ es_predeterminada: true })
      .eq('id', addressId)

    if (error) {
      console.error('Error setting default address:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error setting default address:', error)
    return { success: false, error: 'Error inesperado al establecer dirección predeterminada' }
  }
}

/**
 * Obtener dirección predeterminada del usuario
 */
export async function getDefaultAddress(userId: string): Promise<{ data: UserAddress | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('direcciones_usuario')
      .select('*')
      .eq('usuario_id', userId)
      .eq('es_predeterminada', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return { data: null, error: null }
      }
      console.error('Error fetching default address:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching default address:', error)
    return { data: null, error: 'Error inesperado al obtener dirección predeterminada' }
  }
}