import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Producto } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { useState, useEffect } from 'react'
import StarRating from '@/components/common/StarRating'
import { getProductReviewStats } from '@/lib/reviews'
import type { ReviewStats } from '@/types/reviews'

interface ProductCardProps {
  producto: Producto
  viewMode?: 'grid' | 'list'
}

const ProductCard = ({ producto, viewMode = 'grid' }: ProductCardProps) => {
  const { addToCart, items } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    promedio: 0,
    total: 0,
    distribucion: { cinco: 0, cuatro: 0, tres: 0, dos: 0, uno: 0 }
  })

  // Cargar estadísticas de reseñas al montar el componente
  useEffect(() => {
    const loadReviewStats = async () => {
      const stats = await getProductReviewStats(producto.id)
      setReviewStats(stats)
    }
    loadReviewStats()
  }, [producto.id])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return
    
    setIsLoading(true)
    setMessage(null)
    
    try {
      // Buscar si el producto ya está en el carrito
      const existingItem = items.find(item => item.producto.id === producto.id)
      const currentQuantityInCart = existingItem ? existingItem.cantidad : 0
      
      // Verificar si hay stock disponible
      if (currentQuantityInCart >= producto.stock) {
        setMessage('Sin stock disponible')
        setTimeout(() => setMessage(null), 2000)
        return
      }
      
      addToCart(producto)
      setMessage('¡Agregado al carrito!')
      setTimeout(() => setMessage(null), 1500)
    } catch (error) {
      setMessage('Error al agregar')
      setTimeout(() => setMessage(null), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  // Calcular stock disponible considerando lo que ya está en el carrito
  const existingItem = items.find(item => item.producto.id === producto.id)
  const currentQuantityInCart = existingItem ? existingItem.cantidad : 0
  const availableStock = producto.stock - currentQuantityInCart
  const isOutOfStock = availableStock <= 0

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300 overflow-hidden relative">
        {message && (
          <div className={`absolute top-4 left-4 z-10 text-sm font-medium px-3 py-2 rounded-lg shadow-lg ${
            message.includes('Error') || message.includes('Sin stock') 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {message}
          </div>
        )}
        
        <Link to={`/producto/${producto.id}`}>
          <div className="flex">
            {/* Image Section */}
            <div className="w-48 h-48 flex-shrink-0 overflow-hidden">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gris-oscuro dark:text-gray-100 line-clamp-2 flex-1">
                    {producto.nombre}
                  </h3>
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-dorado dark:text-yellow-400 mb-1">
                      {formatPrice(producto.precio)}
                    </div>
                    <div className="flex items-center justify-end mb-2">
                      <StarRating rating={reviewStats.promedio} readonly size="sm" />
                      {reviewStats.total > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          ({reviewStats.promedio.toFixed(1)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                  {producto.descripcion}
                </p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {producto.categoria}
                  </span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
                    availableStock > 0 
                      ? availableStock > 10 
                        ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30' 
                        : 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                      : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                  }`}>
                    {availableStock > 0 
                      ? availableStock > 10 
                        ? `${availableStock} disponibles` 
                        : `¡Solo quedan ${availableStock}!`
                      : 'Sin stock'
                    }
                  </span>
                  {currentQuantityInCart > 0 && (
                    <span className="text-sm text-blue-700 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                      {currentQuantityInCart} en carrito
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isLoading}
                  className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {isLoading ? 'Agregando...' : isOutOfStock ? 'Sin Stock' : 'Agregar al carrito'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    )
  }

  // Grid View (Default)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300 overflow-hidden group relative">
      {message && (
        <div className={`absolute top-3 left-3 right-3 z-10 text-xs font-medium px-3 py-2 rounded-lg shadow-lg ${
          message.includes('Error') || message.includes('Sin stock') 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {message}
        </div>
      )}
      
      <Link to={`/producto/${producto.id}`}>
        {/* Image Section */}
        <div className="aspect-square overflow-hidden relative">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 shadow-sm">
              {producto.categoria}
            </span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-gris-oscuro dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
            {producto.nombre}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {producto.descripcion}
          </p>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <StarRating rating={reviewStats.promedio} readonly size="sm" />
            {reviewStats.total > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({reviewStats.promedio.toFixed(1)})
              </span>
            )}
          </div>
          
          <div className="mb-4">
            {/* Price */}
            <div className="text-center sm:text-left mb-2">
              <span className="text-xl font-bold text-dorado dark:text-yellow-400">
                {formatPrice(producto.precio)}
              </span>
            </div>
            
            {/* Stock - Below price on mobile, right side on larger screens */}
            <div className="flex flex-col items-center sm:flex-row sm:justify-between">
              <div className="sm:flex-1"></div>
              <div className="text-center sm:text-right">
                <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
                  availableStock > 0 
                    ? availableStock > 10 
                      ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30' 
                      : 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                    : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                }`}>
                  {availableStock > 0 
                    ? availableStock > 10 
                      ? `${availableStock} disponibles` 
                      : `¡Solo ${availableStock}!`
                    : 'Sin stock'
                  }
                </span>
                {currentQuantityInCart > 0 && (
                  <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold mt-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                    {currentQuantityInCart} en carrito
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="w-full btn-primary py-2.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {isLoading ? 'Agregando...' : isOutOfStock ? 'Sin Stock' : 'Agregar'}
              </span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard


