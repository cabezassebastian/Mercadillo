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
  // Campos avanzados
  categoria?: string | null
  only_first_purchase?: boolean
  referred_by?: string | null
  veces_usado?: number
  total_descuento_aplicado?: number
  tipo_cupon?: 'general' | 'primera_compra' | 'cumpleanos' | 'carrito_abandonado' | 'referido'
  es_cumpleanos?: boolean
  es_carrito_abandonado?: boolean
}

export interface CodigoReferido {
  id: string
  usuario_id: string
  codigo_referido: string
  referidos_total: number
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

/**
 * Obtener código de referido del usuario (crea uno si no existe)
 */
export async function obtenerCodigoReferido(usuarioId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .rpc('obtener_codigo_referido', {
        user_id: usuarioId
      })

    if (error) {
      console.error('Error obteniendo código de referido:', error)
      return null
    }

    return data as string
  } catch (error) {
    console.error('Error en obtenerCodigoReferido:', error)
    return null
  }
}

/**
 * Verificar si un código de referido existe
 */
export async function verificarCodigoReferido(codigo: string): Promise<CodigoReferido | null> {
  try {
    const { data, error } = await supabase
      .from('codigos_referidos')
      .select('*')
      .eq('codigo_referido', codigo.toUpperCase())
      .single()

    if (error) return null
    return data as CodigoReferido
  } catch (error) {
    console.error('Error verificando código de referido:', error)
    return null
  }
}

/**
 * Crear cupón de referido para nuevo usuario
 */
export async function crearCuponReferido(
  usuarioId: string,
  codigoReferido: string,
  descuentoPorcentaje: number = 15
): Promise<boolean> {
  try {
    // Verificar que el código existe y obtener el usuario que refiere
    const referidor = await verificarCodigoReferido(codigoReferido)
    if (!referidor) return false

    // Crear cupón para el nuevo usuario (15% descuento)
    const codigoCupon = `REFERIDO-${codigoReferido.substring(0, 6)}-${Date.now()}`
    
    const { error } = await supabase
      .from('cupones')
      .insert([{
        codigo: codigoCupon,
        tipo: 'porcentaje',
        valor: descuentoPorcentaje,
        descripcion: `Cupón de bienvenida por referido de ${referidor.codigo_referido}`,
        fecha_inicio: new Date().toISOString(),
        fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        usos_maximos: 1,
        usos_actuales: 0,
        monto_minimo: 0,
        activo: true,
        tipo_cupon: 'referido',
        referred_by: referidor.usuario_id,
        only_first_purchase: true
      }])

    if (error) {
      console.error('Error creando cupón de referido:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error en crearCuponReferido:', error)
    return false
  }
}

/**
 * Validar si cupón aplica a una categoría específica
 */
export async function cuponAplicaCategoria(
  cuponId: string,
  categoria: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('cupon_aplica_categoria', {
        cupon_id: cuponId,
        producto_categoria: categoria
      })

    if (error) {
      console.error('Error validando categoría de cupón:', error)
      return false
    }

    return data as boolean
  } catch (error) {
    console.error('Error en cuponAplicaCategoria:', error)
    return false
  }
}

/**
 * Verificar si es primera compra del usuario
 */
export async function esPrimeraCompra(usuarioId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('es_primera_compra', {
        user_id: usuarioId
      })

    if (error) {
      console.error('Error verificando primera compra:', error)
      return false
    }

    return data as boolean
  } catch (error) {
    console.error('Error en esPrimeraCompra:', error)
    return false
  }
}

/**
 * Obtener estadísticas de cupones (para admin dashboard)
 */
export async function obtenerEstadisticasCupones() {
  try {
    const { data, error } = await supabase
      .from('cupones_estadisticas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error obteniendo estadísticas de cupones:', error)
    return []
  }
}

/**
 * Registrar uso de cupón en historial
 */
export async function registrarUsoCuponHistorial(
  cuponId: string,
  pedidoId: string,
  usuarioId: string,
  descuentoAplicado: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cupones_usados_historial')
      .insert([{
        cupon_id: cuponId,
        pedido_id: pedidoId,
        usuario_id: usuarioId,
        descuento_aplicado: descuentoAplicado
      }])

    if (error) {
      console.error('Error registrando uso en historial:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error en registrarUsoCuponHistorial:', error)
    return false
  }
}

