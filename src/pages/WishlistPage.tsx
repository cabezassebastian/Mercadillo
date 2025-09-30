import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Heart, ShoppingCart, Trash2, Star, Package } from 'lucide-react'
import { getUserWishlist, removeFromWishlist, type WishlistItem } from '@/lib/userProfile'
import { useCart } from '@/contexts/CartContext'
import { useNotificationHelpers } from '@/contexts/NotificationContext'
import { Link } from 'react-router-dom'

const WishlistPage: React.FC = () => {
  const { user } = useUser()
  const { addToCart } = useCart()
  const { showWishlistRemoved, showCartAdded } = useNotificationHelpers()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadWishlist()
    }
  }, [user?.id])

  const loadWishlist = async () => {
    if (!user?.id) return

    setLoading(true)
    const result = await getUserWishlist(user.id)
    
    if (result.error) {
      setError(result.error)
    } else {
      setWishlistItems(result.data || [])
    }
    
    setLoading(false)
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user?.id) return

    setRemovingId(productId)
    const result = await removeFromWishlist(user.id, productId)
    
    if (result.error) {
      setError(result.error)
    } else {
      const item = wishlistItems.find(item => item.producto_id === productId)
      const productName = item?.producto?.nombre || 'Producto'
      showWishlistRemoved(productName)
      setWishlistItems(prev => prev.filter(item => item.producto_id !== productId))
    }
    
    setRemovingId(null)
  }

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.producto) return

    addToCart({
      id: item.producto.id,
      nombre: item.producto.nombre,
      descripcion: '',
      precio: item.producto.precio,
      imagen: item.producto.imagen,
      stock: item.producto.stock,
      categoria: '',
      created_at: '',
      updated_at: ''
    }, 1)
    
    showCartAdded(item.producto.nombre)
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Lista de Deseos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Tus productos favoritos guardados para más tarde
          </p>
        </div>

        {/* Estadísticas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Total de productos
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {wishlistItems.length}
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </div>

        {/* Lista de productos */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Tu lista de deseos está vacía
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explora nuestros productos y guarda tus favoritos aquí
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {item.producto && (
                  <>
                    {/* Imagen del producto */}
                    <div className="relative">
                      <img
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveFromWishlist(item.producto_id)}
                        disabled={removingId === item.producto_id}
                        className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        title="Remover de lista de deseos"
                      >
                        {removingId === item.producto_id ? (
                          <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-500" />
                        )}
                      </button>
                    </div>

                    {/* Información del producto */}
                    <div className="p-4">
                      <Link
                        to={`/product/${item.producto.id}`}
                        className="block mb-2"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                          {item.producto.nombre}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          S/ {item.producto.precio.toFixed(2)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Stock: {item.producto.stock}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Agregado: {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={item.producto.stock === 0}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {item.producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistPage