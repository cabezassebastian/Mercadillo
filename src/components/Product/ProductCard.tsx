import { Link } from 'react-router-dom'
import { ShoppingCart, Eye } from 'lucide-react'
import { Producto } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

interface ProductCardProps {
  producto: Producto
}

const ProductCard = ({ producto }: ProductCardProps) => {
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

  return (
    <div className="card group hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow duration-300 relative">
      {message && (
        <div className={`absolute top-2 left-2 right-2 z-10 text-xs font-medium px-2 py-1 rounded ${
          message.includes('Error') || message.includes('Sin stock') 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {message}
        </div>
      )}
      
      <Link to={`/producto/${producto.id}`}>
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-2 line-clamp-2">
            {producto.nombre}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {producto.descripcion}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-dorado dark:text-yellow-400">
              {formatPrice(producto.precio)}
            </span>
            <div className="text-right">
              <span className={`text-sm ${availableStock > 0 ? 'text-gray-500 dark:text-gray-400' : 'text-red-500'}`}>
                Stock: {availableStock}
              </span>
              {currentQuantityInCart > 0 && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  En carrito: {currentQuantityInCart}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="btn-secondary flex items-center justify-center px-3"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard


