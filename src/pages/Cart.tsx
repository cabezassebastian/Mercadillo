import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import CheckoutButton from '@/components/Cart/CheckoutButton'

const Cart = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    getSubtotal, 
    getIGV, 
    getTotal 
  } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Agrega algunos productos para comenzar tu compra
            </p>
            <Link
              to="/catalogo"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-8">
          Mi Carrito
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.producto.id} className="card p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                    <img
                      src={item.producto.imagen}
                      alt={item.producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-1">
                      {item.producto.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {item.producto.categoria}
                    </p>
                    <p className="text-lg font-bold text-dorado dark:text-yellow-400">
                      {formatPrice(item.producto.precio)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                        className="p-2 hover:bg-amarillo hover:text-gris-oscuro dark:hover:bg-yellow-500 dark:hover:text-gray-900 transition-all duration-200 rounded-l-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 border-x border-gray-300 dark:border-gray-600 text-gris-oscuro dark:text-gray-200 bg-gray-50 dark:bg-gray-600 min-w-[50px] text-center font-medium">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                        className="p-2 hover:bg-amarillo hover:text-gris-oscuro dark:hover:bg-yellow-500 dark:hover:text-gray-900 disabled:hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-r-lg"
                        disabled={item.cantidad >= item.producto.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.producto.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gris-oscuro dark:text-gray-100 mb-6">
                Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gris-oscuro dark:text-gray-200">{formatPrice(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IGV (18%):</span>
                  <span className="font-medium text-gris-oscuro dark:text-gray-200">{formatPrice(getIGV())}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gris-oscuro dark:text-gray-100">Total:</span>
                    <span className="text-lg font-bold text-dorado dark:text-yellow-400">
                      {formatPrice(getTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <CheckoutButton />
                <Link
                  to="/catalogo"
                  className="w-full btn-secondary text-center py-3 block"
                >
                  Seguir Comprando
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Envío gratis en compras +S/50</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Pago 100% seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart


