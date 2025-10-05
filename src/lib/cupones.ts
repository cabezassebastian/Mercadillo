import { supabase } from './supabase'

export interface Cupon {
  id: string
  codigo: string
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  descripcion: string | null
  fecha_inicio: string
  fecha_expiracion: string | null
  usos_maximos: number | null
  usos_actuales: number
  monto_minimo: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ValidacionCupon {
  valido: boolean
  mensaje: string
  cupon_id: string | null
  codigo?: string | null  // Código del cupón aplicado
  tipo: 'porcentaje' | 'monto_fijo' | null
  valor: number | null
  descuento: number
}

/**
 * Validar cupón usando función SQL
 */
export async function validarCupon(
  codigo: string, 
  usuarioId: string, 
  subtotal: number
): Promise<ValidacionCupon> {
  try {
    const { data, error } = await supabase
      .rpc('validar_cupon', {
        p_codigo: codigo.toUpperCase().trim(),
        p_usuario_id: usuarioId,
        p_subtotal: subtotal
      })

    if (error) {
      console.error('Error validando cupón:', error)
      return {
        valido: false,
        mensaje: 'Error al validar cupón',
        cupon_id: null,
        tipo: null,
        valor: null,
        descuento: 0
      }
    }

    // RPC devuelve array con un resultado
    const resultado = data[0] as ValidacionCupon
    // Agregar el código del cupón al resultado si es válido
    if (resultado.valido) {
      resultado.codigo = codigo.toUpperCase().trim()
    }
    return resultado
  } catch (error) {
    console.error('Error en validarCupon:', error)
    return {
      valido: false,
      mensaje: 'Error al validar cupón',
      cupon_id: null,
      tipo: null,
      valor: null,
      descuento: 0
    }
  }
}

/**
 * Registrar uso de cupón después de crear pedido
 */
export async function registrarUsoCupon(
  cuponId: string,
  usuarioId: string,
  pedidoId: string,
  descuento: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('registrar_uso_cupon', {
        p_cupon_id: cuponId,
        p_usuario_id: usuarioId,
        p_pedido_id: pedidoId,
        p_descuento: descuento
      })

    if (error) {
      console.error('Error registrando uso de cupón:', error)
      return false
    }

    return data as boolean
  } catch (error) {
    console.error('Error en registrarUsoCupon:', error)
    return false
  }
}

/**
 * Obtener todos los cupones (para admin)
 */
export async function obtenerCupones(): Promise<Cupon[]> {
  try {
    const { data, error } = await supabase
      .from('cupones')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error obteniendo cupones:', error)
    return []
  }
}

/**
 * Crear cupón (admin)
 */
export async function crearCupon(cuponData: Omit<Cupon, 'id' | 'created_at' | 'updated_at' | 'usos_actuales'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cupones')
      .insert([cuponData])

    return !error
  } catch (error) {
    console.error('Error creando cupón:', error)
    return false
  }
}

/**
 * Actualizar cupón (admin)
 */
export async function actualizarCupon(id: string, cuponData: Partial<Cupon>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cupones')
      .update(cuponData)
      .eq('id', id)

    return !error
  } catch (error) {
    console.error('Error actualizando cupón:', error)
    return false
  }
}

/**
 * Eliminar cupón (admin)
 */
export async function eliminarCupon(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cupones')
      .delete()
      .eq('id', id)

    return !error
  } catch (error) {
    console.error('Error eliminando cupón:', error)
    return false
  }
}
