import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Eye } from 'lucide-react'
import { Producto } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'

interface ProductCardProps {
  producto: Producto
}

const ProductCard: React.FC<ProductCardProps> = ({ producto }) => {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(producto)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      <Link to={`/producto/${producto.id}`}>
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gris-oscuro mb-2 line-clamp-2">
            {producto.nombre}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {producto.descripcion}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-dorado">
              {formatPrice(producto.precio)}
            </span>
            <span className="text-sm text-gray-500">
              Stock: {producto.stock}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={producto.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar</span>
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


