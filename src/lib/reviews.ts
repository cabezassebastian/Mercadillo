import { supabase } from './supabaseClient'
import { supabaseAdmin } from './supabaseAdmin'
import { hasUserPurchasedProduct } from './orders'
import type { Review, CreateReview, UpdateReview, ReviewStats, UserPurchaseCheck } from '@/types/reviews'

// Verificar si un usuario puede crear una reseña para un producto
export const canUserReviewProduct = async (
  userId: string, 
  productId: string
): Promise<UserPurchaseCheck> => {
  try {
    // Verificar si el usuario es admin
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()

    if (!userError && userData?.rol === 'admin') {
      // Los admins pueden escribir reseñas sin restricciones
      return {
        can_review: true,
        message: 'Admin puede crear reseña sin restricciones',
        pedido_id: null // Admins no necesitan pedido_id
      }
    }

    // Usar la nueva función de orders para verificar compra
    const purchaseResult = await hasUserPurchasedProduct(userId, productId)
    
    if (purchaseResult.error) {
      console.error('Error al verificar compras:', purchaseResult.error)
      return {
        can_review: false,
        message: 'Error al verificar historial de compras'
      }
    }

    if (!purchaseResult.purchased) {
      return {
        can_review: false,
        message: 'Debes haber comprado este producto para poder reseñarlo'
      }
    }

    // Verificar si ya existe una reseña del usuario para este producto
    const { data: existingReview, error: reviewError } = await supabase
      .from('resenas')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .single()

    if (reviewError && reviewError.code !== 'PGRST116') {
      console.error('Error al verificar reseña existente:', reviewError)
      return {
        can_review: false,
        message: 'Error al verificar reseñas existentes'
      }
    }

    if (existingReview) {
      return {
        can_review: false,
        message: 'Ya has creado una reseña para este producto'
      }
    }

    return {
      can_review: true,
      message: 'Puedes crear una reseña para este producto',
      pedido_id: purchaseResult.pedido_id
    }

  } catch (error) {
    console.error('Error en canUserReviewProduct:', error)
    return {
      can_review: false,
      message: 'Error interno del servidor'
    }
  }
}

// Crear una nueva reseña
export const createReview = async (
  userId: string,
  reviewData: CreateReview
): Promise<{ success: boolean; review?: Review; error?: string }> => {
  try {
    // Verificar si el usuario es admin
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()

    const isAdmin = !userError && userData?.rol === 'admin'

    // Solo verificar permisos si NO es admin
    if (!isAdmin) {
      // Verificar que el usuario puede crear la reseña
      const canReview = await canUserReviewProduct(userId, reviewData.producto_id)
      
      if (!canReview.can_review) {
        return {
          success: false,
          error: canReview.message
        }
      }
    }

    // Crear la reseña usando el cliente apropiado
    // Los admins usan supabaseAdmin que bypasea RLS
    const client = isAdmin ? supabaseAdmin : supabase
    
    const { data, error } = await client
      .from('resenas')
      .insert({
        usuario_id: userId,
        producto_id: reviewData.producto_id,
        pedido_id: reviewData.pedido_id,
        calificacion: reviewData.calificacion,
        comentario: reviewData.comentario || null
      })
      .select(`
        *,
        usuario:usuarios(nombre, apellido)
      `)
      .single()

    if (error) {
      console.error('Error al crear reseña:', error)
      return {
        success: false,
        error: 'Error al crear la reseña'
      }
    }

    return {
      success: true,
      review: data as Review
    }

  } catch (error) {
    console.error('Error en createReview:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Obtener reseñas de un producto
export const getProductReviews = async (
  productId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ reviews: Review[]; total: number }> => {
  try {
    // Obtener reseñas con información del usuario
    const { data: reviews, error } = await supabase
      .from('resenas')
      .select(`
        *,
        usuario:usuarios(nombre, apellido)
      `)
      .eq('producto_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error al obtener reseñas:', error)
      return { reviews: [], total: 0 }
    }

    // Obtener total de reseñas
    const { count } = await supabase
      .from('resenas')
      .select('*', { count: 'exact', head: true })
      .eq('producto_id', productId)

    return {
      reviews: reviews as Review[] || [],
      total: count || 0
    }

  } catch (error) {
    console.error('Error en getProductReviews:', error)
    return { reviews: [], total: 0 }
  }
}

// Obtener estadísticas de reseñas de un producto
export const getProductReviewStats = async (productId: string): Promise<ReviewStats> => {
  try {
    const { data: reviews, error } = await supabase
      .from('resenas')
      .select('calificacion')
      .eq('producto_id', productId)

    if (error) {
      console.error('Error al obtener estadísticas de reseñas:', error)
      return {
        promedio: 0,
        total: 0,
        distribucion: { cinco: 0, cuatro: 0, tres: 0, dos: 0, uno: 0 }
      }
    }

    if (!reviews || reviews.length === 0) {
      return {
        promedio: 0,
        total: 0,
        distribucion: { cinco: 0, cuatro: 0, tres: 0, dos: 0, uno: 0 }
      }
    }

    // Calcular promedio
    const total = reviews.length
    const suma = reviews.reduce((acc, review) => acc + review.calificacion, 0)
    const promedio = suma / total

    // Calcular distribución
    const distribucion = {
      cinco: reviews.filter(r => r.calificacion === 5).length,
      cuatro: reviews.filter(r => r.calificacion === 4).length,
      tres: reviews.filter(r => r.calificacion === 3).length,
      dos: reviews.filter(r => r.calificacion === 2).length,
      uno: reviews.filter(r => r.calificacion === 1).length
    }

    return {
      promedio: Math.round(promedio * 10) / 10, // Redondear a 1 decimal
      total,
      distribucion
    }

  } catch (error) {
    console.error('Error en getProductReviewStats:', error)
    return {
      promedio: 0,
      total: 0,
      distribucion: { cinco: 0, cuatro: 0, tres: 0, dos: 0, uno: 0 }
    }
  }
}

// Actualizar una reseña
export const updateReview = async (
  reviewId: string,
  userId: string,
  updateData: UpdateReview
): Promise<{ success: boolean; review?: Review; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('resenas')
      .update(updateData)
      .eq('id', reviewId)
      .eq('usuario_id', userId)
      .select(`
        *,
        usuario:usuarios(nombre, apellido)
      `)
      .single()

    if (error) {
      console.error('Error al actualizar reseña:', error)
      return {
        success: false,
        error: 'Error al actualizar la reseña'
      }
    }

    return {
      success: true,
      review: data as Review
    }

  } catch (error) {
    console.error('Error en updateReview:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Eliminar una reseña
export const deleteReview = async (
  reviewId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verificar si el usuario es admin
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()

    const isAdmin = !userError && userData?.rol === 'admin'

    // Los admins usan supabaseAdmin que bypasea RLS
    // Usuarios normales usan supabase con filtro de usuario_id
    if (isAdmin) {
      const { error } = await supabaseAdmin
        .from('resenas')
        .delete()
        .eq('id', reviewId)

      if (error) {
        console.error('Error al eliminar reseña (admin):', error)
        return {
          success: false,
          error: 'Error al eliminar la reseña'
        }
      }
    } else {
      const { error } = await supabase
        .from('resenas')
        .delete()
        .eq('id', reviewId)
        .eq('usuario_id', userId)

      if (error) {
        console.error('Error al eliminar reseña (usuario):', error)
        return {
          success: false,
          error: 'Error al eliminar la reseña'
        }
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Error en deleteReview:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Obtener reseña de un usuario para un producto específico
export const getUserReviewForProduct = async (
  userId: string,
  productId: string
): Promise<Review | null> => {
  try {
    const { data, error } = await supabase
      .from('resenas')
      .select(`
        *,
        usuario:usuarios(nombre, apellido)
      `)
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error al obtener reseña del usuario:', error)
      return null
    }

    return data as Review || null

  } catch (error) {
    console.error('Error en getUserReviewForProduct:', error)
    return null
  }
}