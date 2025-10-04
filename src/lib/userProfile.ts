import { supabase } from './supabaseClient'
import { enviarEmailBienvenida } from './emails'

// 🎯 NUEVO ENFOQUE SIMPLE: Solo esperar a que el token esté disponible
let _tokenWaitPromise: Promise<string | null> | null = null

async function getClerkToken(timeout = 5000): Promise<string | null> {
  // Si ya hay una espera en curso, reutilizarla
  if (_tokenWaitPromise) return _tokenWaitPromise

  _tokenWaitPromise = (async () => {
    const start = Date.now()
    const getter = (window as any).__getClerkToken

    // Esperar hasta que el getter esté disponible y retorne un token
    while (Date.now() - start < timeout) {
      if (typeof getter === 'function') {
        try {
          const token = await getter()
          if (token) {
            return token
          }
        } catch (e) {
          // ignore
        }
      }
      
      // También escuchar el evento
      const eventPromise = new Promise<boolean>(resolve => {
        const onReady = () => resolve(true)
        window.addEventListener('supabase-session-ready', onReady, { once: true })
        setTimeout(() => resolve(false), 200)
      })
      
      const gotEvent = await eventPromise
      if (gotEvent && typeof getter === 'function') {
        try {
          const token = await getter()
          if (token) {
            return token
          }
        } catch (e) {
          // ignore
        }
      }
      
      await new Promise(r => setTimeout(r, 100))
    }

    console.warn('⏱️ Timeout waiting for Clerk token')
    return null
  })()

  try {
    return await _tokenWaitPromise
  } finally {
    _tokenWaitPromise = null
  }
}

// Mantener esta función para compatibilidad pero simplificada
export async function ensureSupabaseSession(timeout = 5000): Promise<boolean> {
  const token = await getClerkToken(timeout)
  return !!token
}

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

// ==================== PERFIL DE USUARIO ====================

/**
 * Crear perfil de usuario (llamar después de registro exitoso)
 */
export async function createUserProfile(
  userId: string, 
  userData: {
    email: string
    nombre: string
    apellido?: string
    telefono?: string
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const token = await getClerkToken()
    if (!token) {
      console.warn('createUserProfile: No Clerk token available')
      return { success: false, error: 'no_clerk_token' }
    }

    // Crear perfil en la tabla usuarios
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert([{
        id: userId,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido || '',
        telefono: userData.telefono || null,
        rol: 'cliente'
      }])

    if (insertError) {
      console.error('Error creating user profile:', insertError)
      return { success: false, error: insertError.message }
    }

    // Enviar email de bienvenida
    try {
      await enviarEmailBienvenida({
        email: userData.email,
        nombre: userData.nombre
      })
      console.log('✅ Welcome email sent to:', userData.email)
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // No fallar la creación del perfil por error en el email
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error creating user profile:', error)
    return { success: false, error: 'Error inesperado al crear perfil' }
  }
}

// ==================== LISTA DE DESEOS ====================

/**
 * Obtener lista de deseos del usuario
 */
export async function getUserWishlist(userId: string): Promise<{ data: WishlistItem[] | null; error: string | null }> {
  try {
    const token = await getClerkToken()
    if (!token) {
      console.warn('getUserWishlist: No Clerk token available')
      return { data: null, error: 'no_clerk_token' }
    }

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
    const token = await getClerkToken()
    if (!token) {
      console.warn('addToWishlist: No Clerk token available')
      return { data: null, error: 'no_clerk_token' }
    }

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
      return { data: null, error: JSON.stringify(error) }
    }

    console.log('✅ Added to wishlist')
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
    const token = await getClerkToken()
    if (!token) {
      console.warn('removeFromWishlist: No Clerk token available')
      return { success: false, error: 'no_clerk_token' }
    }

    const { error } = await supabase
      .from('lista_deseos')
      .delete()
      .eq('usuario_id', userId)
      .eq('producto_id', productId)

    if (error) {
      console.error('Error removing from wishlist:', error)
      return { success: false, error: JSON.stringify(error) }
    }

    console.log('✅ Removed from wishlist')
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
    const token = await getClerkToken()
    if (!token) {
      return { isInWishlist: false, error: 'no_clerk_token' }
    }

    const { data, error } = await supabase
      .from('lista_deseos')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .maybeSingle()

    if (error) {
      console.error('Error checking wishlist:', error.message)
      return { isInWishlist: false, error: JSON.stringify(error) }
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
    const token = await getClerkToken()
    if (!token) {
      console.warn('getUserNavigationHistory: No Clerk token available')
      return { data: null, error: 'no_clerk_token' }
    }

    const { data, error } = await supabase
      .from('historial_navegacion')
      .select(`
        *,
        producto:productos(id, nombre, precio, imagen, stock, categoria, descripcion, created_at, updated_at)
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
    // 🔑 Esperar el token de Clerk PRIMERO
    const token = await getClerkToken()
    if (!token) {
      console.warn('addToNavigationHistory: No Clerk token available')
      // No fallar, solo no agregar al historial silenciosamente
      return { success: true, error: null }
    }

    // Verificar si ya existe el registro
    const { data: existing } = await supabase
      .from('historial_navegacion')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .maybeSingle()

    if (existing) {
      // Si existe, actualizar el updated_at
      const { error: updateError } = await supabase
        .from('historial_navegacion')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating navigation history:', updateError.message)
        return { success: false, error: updateError.message }
      }
    } else {
      // Si no existe, insertar nuevo registro
      const { error: insertError } = await supabase
        .from('historial_navegacion')
        .insert({
          usuario_id: userId,
          producto_id: productId,
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error inserting navigation history:', insertError.message)
        return { success: false, error: insertError.message }
      }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error adding to navigation history:', error)
    // No fallar la navegación si el historial falla
    return { success: true, error: null }
  }
}

/**
 * Limpiar historial de navegación del usuario
 */
export async function clearNavigationHistory(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const token = await getClerkToken()
    if (!token) {
      console.warn('clearNavigationHistory: No Clerk token available')
      return { success: false, error: 'no_clerk_token' }
    }

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
    const token = await getClerkToken()
    if (!token) {
      console.warn('getUserAddresses: No Clerk token available')
      return { data: null, error: 'no_clerk_token' }
    }

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
    const token = await getClerkToken()
    if (!token) {
      console.warn('createUserAddress: No Clerk token available')
      return { data: null, error: 'no_clerk_token' }
    }

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
    const token = await getClerkToken()
    if (!token) {
      console.warn('updateUserAddress: No Clerk token available')
      return { data: null, error: 'no_clerk_token' }
    }

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
    const token = await getClerkToken()
    if (!token) {
      console.warn('deleteUserAddress: No Clerk token available')
      return { success: false, error: 'no_clerk_token' }
    }

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
    const token = await getClerkToken()
    if (!token) {
      console.warn('setDefaultAddress: No Clerk token available')
      return { success: false, error: 'no_clerk_token' }
    }

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
    const token = await getClerkToken()
    if (!token) {
      console.warn('getDefaultAddress: No Clerk token available')
      return { data: null, error: 'no_clerk_token' }
    }

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