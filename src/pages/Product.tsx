import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import { supabase, Producto } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'

const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const fetchProducto = async () => {
      if (!id) return

      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error fetching product:', error)
          navigate('/catalogo')
          return
        }

        setProducto(data)
      } catch (error) {
        console.error('Error in fetchProducto:', error)
        navigate('/catalogo')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducto()
  }, [id, navigate])

  const handleAddToCart = () => {
    if (producto) {
      addToCart(producto, quantity)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amarillo"></div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gris-oscuro mb-4">
            Producto no encontrado
          </h1>
          <button
            onClick={() => navigate('/catalogo')}
            className="btn-primary"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hueso py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/catalogo')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gris-oscuro transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al catálogo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-blanco">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro mb-2">
                {producto.nombre}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {producto.categoria}
              </p>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amarillo fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">(4.8) - 124 reseñas</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-dorado">
                  {formatPrice(producto.precio)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  producto.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
                </span>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                {producto.descripcion}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-gris-oscuro font-medium">Cantidad:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(producto.stock, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                    disabled={quantity >= producto.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={producto.stock === 0}
                className="w-full btn-primary flex items-center justify-center space-x-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>
                  {producto.stock > 0 ? 'Agregar al carrito' : 'Producto agotado'}
                </span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-amarillo" />
                <div>
                  <p className="font-medium text-gris-oscuro">Envío Gratis</p>
                  <p className="text-sm text-gray-600">En compras +S/50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-amarillo" />
                <div>
                  <p className="font-medium text-gris-oscuro">Garantía</p>
                  <p className="text-sm text-gray-600">30 días</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-6 h-6 text-amarillo" />
                <div>
                  <p className="font-medium text-gris-oscuro">Devolución</p>
                  <p className="text-sm text-gray-600">Fácil y rápida</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Product


