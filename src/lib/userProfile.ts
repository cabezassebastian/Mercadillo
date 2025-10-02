import { supabase } from './supabaseClient'

// Ensure the shared supabase client has an access token derived from Clerk.
// Uses a small retry to wait for the token if Clerk is still propagating.
let _sharedSessionPromise: Promise<boolean> | null = null

export async function ensureSupabaseSession(timeout = 15000): Promise<boolean> {
  try {
    // If supabase already has a session, we're good
    const { data } = await supabase.auth.getSession()
    if (data?.session?.access_token) {
      console.log('ensureSupabaseSession: Session already available')
      return true
    }

    // If another caller is already waiting, reuse that promise so we don't
    // concurrently poll/get the token multiple times.
    if (_sharedSessionPromise) {
      console.log('ensureSupabaseSession: Reusing existing promise')
      return _sharedSessionPromise
    }

    console.log('ensureSupabaseSession: Starting session wait...')

    _sharedSessionPromise = (async () => {
      // Simple approach: wait for AuthSync to set the session via event
      let sessionReady = false
      
      // Listen for the session ready event from AuthSync
      const eventPromise = new Promise<boolean>((resolve) => {
        const onReady = () => {
          console.log('ensureSupabaseSession: Got supabase-session-ready event')
          sessionReady = true
          resolve(true)
        }
        window.addEventListener('supabase-session-ready', onReady, { once: true })
        
        // Also set a timeout
        setTimeout(() => {
          if (!sessionReady) {
            console.warn('ensureSupabaseSession: Event timeout after', timeout + 'ms')
            resolve(false)
          }
        }, timeout)
      })

      // Wait for either the event or timeout
      const result = await eventPromise
      
      if (result) {
        // Double-check the session is actually there
        const { data: finalSession } = await supabase.auth.getSession()
        if (finalSession?.session?.access_token) {
          console.log('ensureSupabaseSession: Session confirmed after event')
          return true
        } else {
          console.warn('ensureSupabaseSession: Event fired but no session found')
          return false
        }
      }

      return false
    })()

    try {
      const result = await _sharedSessionPromise
      console.log('ensureSupabaseSession: Final result:', result)
      return result
    } finally {
      // clear shared promise so subsequent calls can re-check if needed
      _sharedSessionPromise = null
    }
  } catch (err) {
    console.error('ensureSupabaseSession error', err)
    _sharedSessionPromise = null
    return false
  }
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

// ==================== LISTA DE DESEOS ====================

/**
 * Obtener lista de deseos del usuario
 */
export async function getUserWishlist(userId: string): Promise<{ data: WishlistItem[] | null; error: string | null }> {
  try {
    const ok = await ensureSupabaseSession()
    if (!ok) {
      console.warn('getUserWishlist: No supabase session available (Clerk token not ready)')
      return { data: null, error: 'no_supabase_session' }
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
    const ok = await ensureSupabaseSession()
    if (!ok) {
      console.warn('addToWishlist: No supabase session available (Clerk token not ready)')
      return { data: null, error: 'no_supabase_session' }
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
    const ok = await ensureSupabaseSession()
    if (!ok) {
      console.warn('removeFromWishlist: No supabase session available (Clerk token not ready)')
      return { success: false, error: 'no_supabase_session' }
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
    const ok = await ensureSupabaseSession()
    if (!ok) {
      console.warn('isInWishlist: No supabase session available (Clerk token not ready)')
      return { isInWishlist: false, error: 'no_supabase_session' }
    }
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
    console.log(`Intentando agregar al historial: usuario=${userId}, producto=${productId}`);
    
    // Primer intento: usando RPC (que debería obtener el nombre del producto automáticamente)
    try {
      console.log("Intento 1: Llamando a RPC actualizar_historial_navegacion");
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('actualizar_historial_navegacion', {
          p_usuario_id: userId,
          p_producto_id: productId
        });

      if (rpcError) {
        console.error("Error en RPC:", rpcError.message);
        throw rpcError;
      }

      console.log("RPC exitoso:", rpcData);
      return { success: true, error: null };
    } catch (rpcError) {
      console.warn("RPC falló, intentando métodos alternativos:", rpcError);
      
      // Segundo intento: inserción directa sin RLS usando API REST
      console.log("Intento 2: Inserción directa usando fetch API");
      
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/historial_navegacion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            usuario_id: userId,
            producto_id: productId,
            updated_at: new Date().toISOString()
          })
        });

        if (response.ok) {
          console.log("Fetch API exitoso");
          return { success: true, error: null };
        }
        
        const errorText = await response.text();
        console.error("Error en fetch API:", response.status, errorText);
      } catch (fetchError) {
        console.error("Error en fetch:", fetchError);
      }

      // Tercer intento: UPSERT usando Supabase client con manejo de RLS
      console.log("Intento 3: UPSERT usando Supabase client");
      
      try {
        const { data: upsertData, error: upsertError } = await supabase
          .from('historial_navegacion')
          .upsert({
            usuario_id: userId,
            producto_id: productId,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'usuario_id,producto_id',
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error("Error en UPSERT:", upsertError.message);
          
          // Cuarto intento: inserción simple sin upsert
          console.log("Intento 4: Inserción simple");
          const { data: insertData, error: insertError } = await supabase
            .from('historial_navegacion')
            .insert({
              usuario_id: userId,
              producto_id: productId,
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error("Todos los métodos fallaron. Último error:", insertError.message);
            return { success: false, error: `Error: ${insertError.message}. El historial no se pudo guardar.` };
          }

          console.log("Inserción simple exitosa:", insertData);
          return { success: true, error: null };
        }

        console.log("UPSERT exitoso:", upsertData);
        return { success: true, error: null };
      } catch (upsertError) {
        console.error("Error en operaciones con Supabase client:", upsertError);
        return { success: false, error: "Todos los métodos fallaron. El historial no se pudo guardar." };
      }
    }
  } catch (error) {
    console.error("Error general al agregar al historial de navegación:", error);
    return { success: false, error: "Error general. El historial no se pudo guardar." };
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