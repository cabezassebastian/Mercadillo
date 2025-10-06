// Tipos para el sistema de reseñas
export interface Review {
  id: string
  usuario_id: string
  producto_id: string
  pedido_id: string | null // Puede ser null para reseñas de admin
  calificacion: number // 1-5 estrellas
  comentario?: string
  created_at: string
  updated_at: string
  // Información del usuario (join)
  usuario?: {
    nombre: string
    apellido: string
  }
}

export interface CreateReview {
  producto_id: string
  pedido_id: string | null // Puede ser null para reseñas de admin
  calificacion: number
  comentario?: string
}

export interface UpdateReview {
  calificacion?: number
  comentario?: string
}

export interface ReviewStats {
  promedio: number
  total: number
  distribucion: {
    cinco: number
    cuatro: number
    tres: number
    dos: number
    uno: number
  }
}

export interface UserPurchaseCheck {
  can_review: boolean
  pedido_id?: string | null // Puede ser undefined o null
  message: string
}