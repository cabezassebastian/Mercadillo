import { Link } from 'react-router-dom'
import { ShoppingCart, Eye, Star } from 'lucide-react'
import { Producto } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

interface ProductCardProps {
  producto: Producto
  viewMode?: 'grid' | 'list'
}

const ProductCard = ({ producto, viewMode = 'grid' }: ProductCardProps) => {
  const { addToCart, items } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300 overflow-hidden relative border border-gray-200 dark:border-gray-700">
        {message && (
          <div className={`absolute top-4 left-4 z-10 text-sm font-bold px-3 py-2 rounded-lg shadow-lg ${
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
            <div className="w-48 h-48 flex-shrink-0 overflow-hidden relative">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {/* Stock indicator overlay */}
              <div className="absolute top-3 left-3">
                <div className={`px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 ${
                  availableStock > 10 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : availableStock > 0 
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {availableStock > 10 
                    ? `${availableStock}+ disponibles` 
                    : availableStock > 0 
                      ? `Solo ${availableStock} left`
                      : 'Sin stock'
                  }
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gris-oscuro dark:text-gray-100 line-clamp-2 flex-1">
                    {producto.nombre}
                  </h3>
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text mb-1">
                      {formatPrice(producto.precio)}
                    </div>
                    <div className="flex items-center justify-end space-x-1 mb-2 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 ml-1 font-bold">(4.0)</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed font-medium">
                  {producto.descripcion}
                </p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                    {producto.categoria}
                  </span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                    availableStock > 0 
                      ? availableStock > 10 
                        ? 'text-green-800 bg-green-100 border border-green-300' 
                        : 'text-yellow-800 bg-yellow-100 border border-yellow-300'
                      : 'text-red-800 bg-red-100 border border-red-300'
                  }`}>
                    {availableStock > 0 
                      ? availableStock > 10 
                        ? `${availableStock} disponibles` 
                        : `¡Solo quedan ${availableStock}!`
                      : 'Sin stock'
                    }
                  </span>
                  {currentQuantityInCart > 0 && (
                    <span className="text-sm text-blue-800 dark:text-blue-300 font-bold bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-300 dark:border-blue-700">
                      {currentQuantityInCart} en carrito
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isLoading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg border-2 border-yellow-400 hover:border-yellow-500 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {isLoading ? 'Agregando...' : isOutOfStock ? 'Sin Stock' : 'Agregar al carrito'}
                  </span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/producto/${producto.id}`;
                  }}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg border-2 border-gray-500 hover:border-gray-600 dark:border-gray-400 dark:hover:border-gray-500 transform hover:scale-105 transition-all duration-200 text-base flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Ver detalles</span>
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300 overflow-hidden group relative border border-gray-200 dark:border-gray-700">
      {message && (
        <div className={`absolute top-3 left-3 right-3 z-10 text-xs font-bold px-3 py-2 rounded-lg shadow-lg ${
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
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-600">
              {producto.categoria}
            </span>
          </div>
          {/* Stock indicator overlay for better visibility */}
          <div className="absolute top-3 left-3">
            <div className={`px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 ${
              availableStock > 10 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : availableStock > 0 
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              {availableStock > 10 
                ? `${availableStock}+` 
                : availableStock > 0 
                  ? `${availableStock} left`
                  : 'Out of stock'
              }
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-5 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-800">
          <h3 className="font-bold text-lg text-gris-oscuro dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
            {producto.nombre}
          </h3>
          
          <p className="text-sm text-gray-700 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed font-medium">
            {producto.descripcion}
          </p>
          
          {/* Rating with enhanced styling */}
          <div className="flex items-center space-x-1 mb-3 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <Star className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            <span className="text-xs text-gray-700 dark:text-gray-300 ml-1 font-bold">(4.0)</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
              <span className="text-xl font-black">
                {formatPrice(producto.precio)}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                availableStock > 0 
                  ? availableStock > 10 
                    ? 'text-green-800 bg-green-100 border border-green-300' 
                    : 'text-yellow-800 bg-yellow-100 border border-yellow-300'
                  : 'text-red-800 bg-red-100 border border-red-300'
              }`}>
                {availableStock > 0 
                  ? availableStock > 10 
                    ? `${availableStock} disponibles` 
                    : `¡Solo ${availableStock}!`
                  : 'Sin stock'
                }
              </span>
              {currentQuantityInCart > 0 && (
                <div className="text-xs text-blue-800 dark:text-blue-300 font-bold mt-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-300 dark:border-blue-700">
                  {currentQuantityInCart} en carrito
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons with enhanced styling */}
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg border-2 border-yellow-400 hover:border-yellow-500 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {isLoading ? 'Agregando...' : isOutOfStock ? 'Sin Stock' : 'Agregar'}
              </span>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/producto/${producto.id}`;
              }}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white font-bold flex items-center justify-center px-4 py-2.5 text-sm rounded-lg shadow-lg border-2 border-gray-500 hover:border-gray-600 dark:border-gray-400 dark:hover:border-gray-500 transform hover:scale-110 transition-all duration-200"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard


