import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ArrowLeft, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react'
import { supabase, Producto, ProductoImagen } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import StarRating from '@/components/common/StarRating'
import ReviewList from '@/components/Reviews/ReviewList'
import WishlistButton from '@/components/common/WishlistButton'
import ProductGallery from '@/components/Product/ProductGallery'
import RelatedProducts from '@/components/Product/RelatedProducts'
import { getProductReviewStats } from '@/lib/reviews'
import { addToNavigationHistory } from '@/lib/userProfile'
import type { ReviewStats } from '@/types/reviews'
import VariantsSelector from '@/components/Product/VariantsSelector'

const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  const { addToCart, items } = useCart()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [productoImagenes, setProductoImagenes] = useState<ProductoImagen[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    promedio: 0,
    total: 0,
    distribucion: { cinco: 0, cuatro: 0, tres: 0, dos: 0, uno: 0 }
  })
  const [reviewsRefreshTrigger] = useState(0)

  
  const [options, setOptions] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null)

  useEffect(() => {
    const fetchProducto = async () => {
      if (!id) return

      try {
        // try serverless API first (works in Vercel). If it fails (dev or env missing), fallback to client query below.
        const resp = await fetch(`/api/products/${id}`)
        if (resp.ok) {
          const json = await resp.json()
          const { product, options: opts, variants: vars } = json

          setProducto(product)
          setOptions(opts || [])
          setVariants(vars || [])

          // Cargar imágenes del producto (still from client table)
          const { data: imagenesData, error: imagenesError } = await supabase
            .from('producto_imagenes')
            .select('*')
            .eq('producto_id', product.id)
            .order('orden', { ascending: true })

          if (!imagenesError && imagenesData) setProductoImagenes(imagenesData)

          const stats = await getProductReviewStats(product.id)
          setReviewStats(stats)

          if (user?.id) {
            try { await addToNavigationHistory(user.id, product.id) } catch (e) { console.error(e) }
          }
        } else {
          // API failed — fallback to client-side Supabase query so page still shows in dev/local
          console.warn('/api/products failed, falling back to client Supabase')
          const { data: product, error: pErr } = await supabase
            .from('productos')
            .select('*')
            .eq('id', id)
            .single()

          if (!pErr && product) {
            setProducto(product)

            const { data: imagenesData, error: imagenesError } = await supabase
              .from('producto_imagenes')
              .select('*')
              .eq('producto_id', product.id)
              .order('orden', { ascending: true })

            if (!imagenesError && imagenesData) setProductoImagenes(imagenesData)

            const stats = await getProductReviewStats(product.id)
            setReviewStats(stats)

            // Also fetch options + values + variants from client as fallback
            try {
              const { data: options } = await supabase
                .from('product_options')
                .select('id, name')
                .eq('product_id', product.id)
                .order('position', { ascending: true })

              const optionsWithValues: any[] = []
              if (options && options.length) {
                for (const opt of options) {
                  const { data: values } = await supabase
                    .from('product_option_values')
                    .select('id, value, metadata')
                    .eq('option_id', opt.id)
                    .order('position', { ascending: true })
                  optionsWithValues.push({ ...opt, values: values || [] })
                }
              }
              setOptions(optionsWithValues)

              const { data: variants } = await supabase
                .from('product_variants')
                .select('*')
                .eq('product_id', product.id)

              setVariants(variants || [])
            } catch (fetchErr) {
              console.warn('Fallback: could not load options/variants', fetchErr)
            }
          } else {
            // product not found via API nor via client
            console.error('Product not found by API nor by client', pErr)
            navigate('/catalogo')
          }
        }
      } catch (error) {
        console.error('Error in fetchProducto unexpected:', error)
        // try a last-ditch client fetch before giving up
        try {
          const { data: product, error: pErr } = await supabase
            .from('productos')
            .select('*')
            .eq('id', id)
            .single()
          if (!pErr && product) {
            setProducto(product)
          } else {
            navigate('/catalogo')
          }
        } catch (err2) {
          console.error('Fallback client fetch also failed', err2)
          navigate('/catalogo')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducto()
  }, [id, navigate])

  const handleAddToCart = async () => {
    if (!producto) return

    setAddingToCart(true)
    setMessage(null)

    try {
      // Verificar stock disponible considerando variantes y lo que ya está en el carrito
      const existingItem = selectedVariant
        ? items.find(item => item.producto.id === producto.id && (item.producto as any).variant_id === selectedVariant.id)
        : items.find(item => item.producto.id === producto.id && !(item.producto as any).variant_id)

      const currentQuantityInCart = existingItem ? existingItem.cantidad : 0
      const stockSource = selectedVariant ? (selectedVariant.stock ?? producto.stock) : producto.stock
      const available = stockSource - currentQuantityInCart

      if (quantity > available) {
        setMessage(`Solo ${available} unidades disponibles`)
        setTimeout(() => setMessage(null), 3000)
        return
      }

      // If variant selected, override product fields for cart item (price/stock) and include variant_id
      if (selectedVariant) {
        const productoConVariant = {
          ...(producto as any),
          precio: selectedVariant.price ?? producto.precio,
          stock: selectedVariant.stock ?? producto.stock,
          variant_id: selectedVariant.id,
        } as any

        addToCart(productoConVariant, quantity)
      } else {
        addToCart(producto, quantity)
      }

      setMessage(`¡${quantity} producto${quantity > 1 ? 's' : ''} agregado${quantity > 1 ? 's' : ''} al carrito!`)
      setTimeout(() => setMessage(null), 2000)

      // Resetear cantidad si se agotó el stock
      const newAvailableStock = available - quantity
      if (quantity >= newAvailableStock) {
        setQuantity(1)
      }
    } catch (error) {
      setMessage('Error al agregar al carrito')
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setAddingToCart(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  // Calcular stock disponible considerando la variante seleccionada y lo que ya está en el carrito
  const existingItem = producto
    ? (selectedVariant
        ? items.find(item => item.producto.id === producto.id && (item.producto as any).variant_id === selectedVariant.id)
        : items.find(item => item.producto.id === producto.id && !(item.producto as any).variant_id))
    : null
  const currentQuantityInCart = existingItem ? existingItem.cantidad : 0
  const availableStock = producto
    ? ((selectedVariant ? (selectedVariant.stock ?? producto.stock) : producto.stock) - currentQuantityInCart)
    : 0

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
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') || message.includes('Solo') 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {message}
          </div>
        )}
        
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
            <ProductGallery 
              images={productoImagenes}
              productName={producto.nombre}
              fallbackImage={producto.imagen}
            />
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
                <StarRating rating={reviewStats.promedio} readonly size="md" />
                <span className="text-gray-600">
                  {reviewStats.total > 0 
                    ? `(${reviewStats.promedio.toFixed(1)}) - ${reviewStats.total} reseña${reviewStats.total > 1 ? 's' : ''}` 
                    : 'Sin reseñas aún'
                  }
                </span>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-dorado">
                  {selectedVariant?.price ? formatPrice(selectedVariant.price) : formatPrice(producto.precio)}
                </span>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    availableStock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {availableStock > 0 ? `${availableStock} disponibles` : 'Agotado'}
                  </span>
                  {currentQuantityInCart > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      Ya tienes {currentQuantityInCart} en tu carrito
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                {producto.descripcion}
              </p>
              {/* Variant selectors */}
              {options && options.length > 0 && (
                <div className="pt-4">
                  <VariantsSelector options={options} variants={variants} onVariantChange={setSelectedVariant} />
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-gris-oscuro dark:text-gray-200 font-medium">Cantidad:</label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-amarillo hover:text-gris-oscuro dark:hover:bg-yellow-500 dark:hover:text-gray-900 disabled:hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-l-lg font-semibold text-lg"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gris-oscuro dark:text-gray-200 font-medium min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-amarillo hover:text-gris-oscuro dark:hover:bg-yellow-500 dark:hover:text-gray-900 disabled:hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-r-lg font-semibold text-lg"
                    disabled={quantity >= availableStock}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Máximo: {availableStock}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock === 0 || addingToCart}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>
                    {addingToCart 
                      ? 'Agregando...' 
                      : availableStock > 0 
                        ? 'Agregar al carrito' 
                        : 'Producto agotado'
                    }
                  </span>
                </button>

                <WishlistButton 
                  productId={producto.id}
                  productName={producto.nombre}
                  showText={true}
                  className="sm:w-auto w-full px-6 py-4 text-lg rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
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

  {/* Related Products Section */}
  <RelatedProducts productId={producto.id} category={producto.categoria} price={producto.precio} />

  {/* Reviews Section */}
        <div className="mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">
                  Reseñas del producto
                </h2>
                {reviewStats.total > 0 && (
                  <div className="flex items-center gap-4 mt-2">
                    <StarRating rating={reviewStats.promedio} readonly size="sm" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {reviewStats.promedio.toFixed(1)} de 5 estrellas ({reviewStats.total} reseña{reviewStats.total > 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <ReviewList 
                  productId={producto.id} 
                  refreshTrigger={reviewsRefreshTrigger}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Product


