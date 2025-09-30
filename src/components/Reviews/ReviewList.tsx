import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import StarRating from '@/components/common/StarRating'
import { getProductReviews, deleteReview, getUserReviewForProduct } from '@/lib/reviews'
import type { Review } from '@/types/reviews'
import { MessageCircle, Trash2, User, Calendar } from 'lucide-react'
import ReviewForm from './ReviewForm'

interface ReviewListProps {
  productId: string
  refreshTrigger?: number
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, refreshTrigger = 0 }) => {
  const { user } = useUser()
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDeleting, setIsDeleting] = useState<string>('')
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const reviewsPerPage = 5

  // Cargar reseñas del producto
  const loadReviews = async () => {
    setIsLoading(true)
    
    try {
      const offset = (currentPage - 1) * reviewsPerPage
      const { reviews: productReviews, total } = await getProductReviews(
        productId, 
        reviewsPerPage, 
        offset
      )
      
      setReviews(productReviews)
      setTotalReviews(total)

      // Si el usuario está autenticado, cargar su reseña
      if (user?.id) {
        const userProductReview = await getUserReviewForProduct(user.id, productId)
        setUserReview(userProductReview)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [productId, currentPage, user?.id, refreshTrigger])

  const handleDeleteReview = async (reviewId: string) => {
    if (!user?.id) return
    
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar tu reseña?')
    if (!confirmDelete) return

    setIsDeleting(reviewId)
    
    const result = await deleteReview(reviewId, user.id)
    
    if (result.success) {
      // Actualizar la lista de reseñas
      await loadReviews()
    } else {
      alert(result.error || 'Error al eliminar la reseña')
    }
    
    setIsDeleting('')
  }

  const handleReviewCreated = () => {
    setShowReviewForm(false)
    loadReviews() // Recargar reseñas después de crear una nueva
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const totalPages = Math.ceil(totalReviews / reviewsPerPage)

  if (isLoading && currentPage === 1) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Botón para agregar reseña (solo si el usuario puede) */}
      {user && !userReview && !showReviewForm && (
        <div className="text-center">
          <button
            onClick={() => setShowReviewForm(true)}
            className="
              inline-flex items-center gap-2 px-4 py-2
              bg-azul hover:bg-blue-600 text-white
              rounded-lg font-medium transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-azul focus:ring-opacity-50
            "
          >
            <MessageCircle className="w-4 h-4" />
            Escribir reseña
          </button>
        </div>
      )}

      {/* Formulario de nueva reseña */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onReviewCreated={handleReviewCreated}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reseña del usuario actual (si existe) */}
      {userReview && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Tu reseña
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Calendar className="w-3 h-3" />
                  {formatDate(userReview.created_at)}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDeleteReview(userReview.id)}
              disabled={isDeleting === userReview.id}
              className="
                p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200
                disabled:opacity-50 disabled:cursor-not-allowed
                rounded transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
              "
              title="Eliminar reseña"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <StarRating rating={userReview.calificacion} readonly size="sm" />
          
          {userReview.comentario && (
            <p className="mt-3 text-blue-800 dark:text-blue-200">
              {userReview.comentario}
            </p>
          )}
        </div>
      )}

      {/* Lista de reseñas */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gris-oscuro dark:text-gray-100">
                    {review.usuario?.nombre} {review.usuario?.apellido}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(review.created_at)}
                  </div>
                </div>
              </div>
              
              <StarRating rating={review.calificacion} readonly size="sm" />
              
              {review.comentario && (
                <p className="mt-3 text-gris-oscuro dark:text-gray-200">
                  {review.comentario}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        !showReviewForm && !userReview && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Aún no hay reseñas para este producto
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Sé el primero en compartir tu opinión
            </p>
          </div>
        )
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            className="
              px-3 py-1 text-sm
              border border-gray-300 dark:border-gray-600
              text-gris-oscuro dark:text-gray-200
              hover:bg-gray-50 dark:hover:bg-gray-700
              disabled:opacity-50 disabled:cursor-not-allowed
              rounded transition-colors duration-200
            "
          >
            Anterior
          </button>
          
          <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="
              px-3 py-1 text-sm
              border border-gray-300 dark:border-gray-600
              text-gris-oscuro dark:text-gray-200
              hover:bg-gray-50 dark:hover:bg-gray-700
              disabled:opacity-50 disabled:cursor-not-allowed
              rounded transition-colors duration-200
            "
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewList