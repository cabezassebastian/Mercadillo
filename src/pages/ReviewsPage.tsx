import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Star, MessageCircle, Package, Calendar, Edit3, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Link } from 'react-router-dom'

interface UserReview {
  id: string
  producto_id: string
  pedido_id: string
  calificacion: number
  comentario: string
  created_at: string
  updated_at: string
  producto: {
    id: string
    nombre: string
    imagen: string
    precio: number
  }
}

const ReviewsPage: React.FC = () => {
  const { user } = useUser()
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadUserReviews()
    }
  }, [user?.id])

  const loadUserReviews = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('resenas')
        .select(`
          *,
          producto:productos(id, nombre, imagen, precio)
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setReviews(data || [])
      }
    } catch (err) {
      setError('Error inesperado al cargar reseñas')
    }
    setLoading(false)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) return

    setDeletingId(reviewId)
    try {
      const { error } = await supabase
        .from('resenas')
        .delete()
        .eq('id', reviewId)
        .eq('usuario_id', user?.id)

      if (error) {
        setError(error.message)
      } else {
        setReviews(prev => prev.filter(review => review.id !== reviewId))
      }
    } catch (err) {
      setError('Error al eliminar la reseña')
    }
    setDeletingId(null)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.calificacion, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      counts[review.calificacion as keyof typeof counts]++
    })
    return counts
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const ratingCounts = getRatingCounts()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Mis Reseñas
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Todas las reseñas que has escrito sobre productos que compraste
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Resumen general */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Total de Reseñas
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {reviews.length}
                </p>
              </div>
              <MessageCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center space-x-2">
                {renderStars(Math.round(Number(getAverageRating())))}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Promedio: {getAverageRating()}
                </span>
              </div>
            )}
          </div>

          {/* Distribución de calificaciones */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Distribución
            </h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                    {rating}★
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: reviews.length > 0 ? `${(ratingCounts[rating as keyof typeof ratingCounts] / reviews.length) * 100}%` : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {ratingCounts[rating as keyof typeof ratingCounts]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Productos reseñados */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Productos Reseñados
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {new Set(reviews.map(r => r.producto_id)).size}
                </p>
              </div>
              <Package className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Productos únicos con reseña
            </p>
          </div>
        </div>

        {/* Lista de reseñas */}
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No has escrito reseñas aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Compra productos y comparte tu experiencia con otros usuarios
            </p>
            <Link
              to="/profile/orders"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Ver Mis Pedidos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Header de la reseña */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={review.producto?.imagen || '/placeholder-product.jpg'}
                        alt={review.producto?.nombre}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <Link
                          to={`/producto/${review.producto_id}`}
                          className="block"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                            {review.producto?.nombre}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-2 mt-1">
                          {renderStars(review.calificacion)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {review.calificacion}/5 estrellas
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingId === review.id}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        title="Eliminar reseña"
                      >
                        {deletingId === review.id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Comentario */}
                  {review.comentario && (
                    <div className="mb-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        "{review.comentario}"
                      </p>
                    </div>
                  )}

                  {/* Footer de la reseña */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(review.created_at).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {review.updated_at !== review.created_at && (
                        <div className="flex items-center space-x-1">
                          <Edit3 className="w-4 h-4" />
                          <span>Editada</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      S/ {review.producto?.precio?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsPage