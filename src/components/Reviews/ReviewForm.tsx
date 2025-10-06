import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useAuth } from '@/contexts/AuthContext'
import StarRating from '@/components/common/StarRating'
import { createReview, canUserReviewProduct } from '@/lib/reviews'
import type { CreateReview } from '@/types/reviews'
import { MessageCircle, Send, AlertCircle, Shield } from 'lucide-react'

interface ReviewFormProps {
  productId: string
  onReviewCreated?: () => void
  onCancel?: () => void
  skipPurchaseValidation?: boolean // Para testing
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewCreated,
  onCancel,
  skipPurchaseValidation = false
}) => {
  const { user } = useUser()
  const { isAdmin } = useAuth()
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [canReview, setCanReview] = useState<boolean | null>(null)
  const [pedidoId, setPedidoId] = useState<string>('')
  const [isCheckingPermission, setIsCheckingPermission] = useState<boolean>(true)

  // Verificar si el usuario puede crear una reseña al cargar el componente
  React.useEffect(() => {
    const checkPermission = async () => {
      if (!user?.id) return
      
      // Admins pueden escribir reseñas sin restricciones
      if (isAdmin) {
        setCanReview(true)
        setPedidoId('admin-review') // ID especial para reseñas de admin
        setIsCheckingPermission(false)
        return
      }
      
      // Si estamos en modo testing, saltarse la validación
      if (skipPurchaseValidation) {
        setCanReview(true)
        setPedidoId('test-order-id')
        setIsCheckingPermission(false)
        return
      }
      
      setIsCheckingPermission(true)
      const permission = await canUserReviewProduct(user.id, productId)
      setCanReview(permission.can_review)
      setPedidoId(permission.pedido_id || '')
      if (!permission.can_review) {
        setError(permission.message)
      }
      setIsCheckingPermission(false)
    }

    checkPermission()
  }, [user?.id, productId, skipPurchaseValidation, isAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      setError('Debes estar autenticado para crear una reseña')
      return
    }

    if (rating === 0) {
      setError('Debes seleccionar una calificación')
      return
    }

    if (!pedidoId) {
      setError('No se encontró el pedido asociado')
      return
    }

    setIsSubmitting(true)
    setError('')

    const reviewData: CreateReview = {
      producto_id: productId,
      pedido_id: pedidoId,
      calificacion: rating,
      comentario: comment.trim() || undefined
    }

    const result = await createReview(user.id, reviewData)

    if (result.success) {
      // Limpiar formulario
      setRating(0)
      setComment('')
      if (onReviewCreated) {
        onReviewCreated()
      }
    } else {
      setError(result.error || 'Error al crear la reseña')
    }

    setIsSubmitting(false)
  }

  const handleCancel = () => {
    setRating(0)
    setComment('')
    setError('')
    if (onCancel) {
      onCancel()
    }
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-yellow-800 dark:text-yellow-200">
            Debes iniciar sesión para escribir una reseña
          </p>
        </div>
      </div>
    )
  }

  if (isCheckingPermission) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (canReview === false) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Escribe tu reseña
          </h3>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
            <Shield className="w-3 h-3" />
            <span>ADMIN</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Calificación con estrellas */}
        <div>
          <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
            Calificación *
          </label>
          <div className="mb-2">
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
              showText={false}
            />
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Has seleccionado {rating} de 5 estrella{rating !== 1 ? 's' : ''}
            </p>
          )}
          {rating === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Haz clic en las estrellas para calificar
            </p>
          )}
        </div>

        {/* Comentario */}
        <div>
          <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos qué te pareció este producto..."
            rows={4}
            maxLength={500}
            className="
              w-full px-3 py-2 
              border border-gray-300 dark:border-gray-600 
              rounded-lg
              bg-white dark:bg-gray-700
              text-gris-oscuro dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:ring-2 focus:ring-azul dark:focus:ring-blue-500 focus:border-transparent
              resize-none
            "
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="
              flex items-center gap-2 px-6 py-3
              bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
              disabled:bg-gray-400 disabled:cursor-not-allowed
              text-white font-semibold
              rounded-lg shadow-md hover:shadow-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              border border-blue-700 dark:border-blue-400
            "
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="
                px-6 py-3
                border-2 border-gray-400 dark:border-gray-500
                bg-white dark:bg-gray-800
                text-gray-700 dark:text-gray-200 font-semibold
                hover:bg-gray-100 dark:hover:bg-gray-700
                hover:border-gray-500 dark:hover:border-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
                rounded-lg shadow-md hover:shadow-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50
              "
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ReviewForm