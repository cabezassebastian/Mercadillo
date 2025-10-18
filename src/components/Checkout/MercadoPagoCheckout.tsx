import React, { useState, useEffect } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { createPaymentPreference, mapCartToMercadoPagoItems, calculateTotals, mercadoPagoConfig } from '@/lib/mercadopago'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@clerk/clerk-react'
import { Loader2, CreditCard, Smartphone } from 'lucide-react'

// Inicializar Mercado Pago solo si la clave existe
if (mercadoPagoConfig.publicKey) {
  initMercadoPago(mercadoPagoConfig.publicKey, {
    locale: 'es-PE'
  })
}

interface MercadoPagoCheckoutProps {
  onSuccess?: (paymentData: any) => void
  onError?: (error: any) => void
  shippingAddress?: string
  deliveryData?: {
    nombreCompleto: string
    dni: string
    telefono: string
    direccion: string
    metodoEntrega: 'envio' | 'contraentrega' | 'tienda'
  }
}

const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  onError,
  shippingAddress = "Lima, Perú",
  deliveryData
}) => {
  const { items, cuponAplicado, getDescuento, getSubtotal, getTotal } = useCart()
  const { user } = useUser()
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreatePreference = async () => {
    if (!user || items.length === 0) {
      setError('No hay productos en el carrito o usuario no autenticado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const baseUrl = window.location.origin
      // Convertir CartItem[] a formato intermedio incluyendo datos de variante (si aplica)
      const cartForMP = items.map(item => ({
        id: item.producto.variant_id ? `${item.producto.id}-${item.producto.variant_id}` : item.producto.id,
        nombre: item.producto.nombre + (item.producto.variant_label ? ` — ${item.producto.variant_label}` : ''),
        precio: item.producto.precio,
        cantidad: item.cantidad,
        imagen: item.producto.imagen,
        variant_id: item.producto.variant_id || null,
        variant_label: item.producto.variant_label || null,
      }))
      
      const mpItems = mapCartToMercadoPagoItems(cartForMP, baseUrl)
      const totals = calculateTotals(mpItems)

      const preferenceData = {
        items: mpItems,
        payer: {
          name: user.fullName || user.firstName || 'Cliente',
          email: user.emailAddresses[0]?.emailAddress || 'cliente@mercadillo.app',
          phone: user.phoneNumbers[0]?.phoneNumber
        },
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`
        },
        auto_return: 'all' as const, // Redirigir automáticamente en todos los casos (approved, rejected, cancelled)
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        // Nuevos campos para integración con Supabase
        user_id: user.id,
        shipping_address: shippingAddress || 'Lima, Perú',
        // Campos de cupón
        descuento: getDescuento(),
        cupon_codigo: cuponAplicado?.codigo || null,
        // Datos de entrega (solo incluir si existen)
        delivery_data: deliveryData ? {
          nombre_completo: deliveryData.nombreCompleto || '',
          dni: deliveryData.dni || null, // null si está vacío
          telefono: deliveryData.telefono || '',
          direccion: deliveryData.direccion || null, // null si está vacío para tienda
          metodo_entrega: deliveryData.metodoEntrega
        } : null,
        metadata: {
          user_id: user.id,
          order_total: totals.total,
          metodo_entrega: deliveryData?.metodoEntrega || 'envio',
          dni_cliente: deliveryData?.dni || null, // null en lugar de string vacío
          telefono_contacto: deliveryData?.telefono || ''
        }
      }

      const preference = await createPaymentPreference(preferenceData)
      setPreferenceId(preference.id)
      
    } catch (err) {
      console.error('Error creating preference:', err)
      setError('Error al crear la preferencia de pago')
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    setError('Error en el pago')
    onError?.(error)
  }

  useEffect(() => {
    if (items.length > 0 && user) {
      handleCreatePreference()
    }
  }, [items, user])

  if (items.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">No hay productos en el carrito</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Preparando checkout...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={handleCreatePreference}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen del pedido */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Resumen del Pedido
        </h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.producto.id} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {item.producto.nombre} x {item.cantidad}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                S/ {(item.producto.precio * item.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
          
          <div className="border-t pt-2 mt-2 space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-gray-100">
                S/ {getSubtotal().toFixed(2)}
              </span>
            </div>
            
            {/* Descuento por cupón (si existe) */}
            {getDescuento() > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  Descuento {cuponAplicado?.tipo === 'porcentaje' && `(${cuponAplicado.valor}%)`}:
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  -S/ {getDescuento().toFixed(2)}
                </span>
              </div>
            )}
            
            {/* Total */}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span className="text-gray-900 dark:text-gray-100">Total:</span>
              <span className="text-gray-900 dark:text-gray-100">
                S/ {getTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de pago disponibles */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          <CreditCard className="w-4 h-4 mr-2" />
          Métodos de pago disponibles:
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <div className="flex items-center">
            <CreditCard className="w-3 h-3 mr-2" />
            Tarjetas de crédito y débito
          </div>
          <div className="flex items-center">
            <Smartphone className="w-3 h-3 mr-2" />
            Yape, Plin y transferencias bancarias
          </div>
          <div>• PagoEfectivo y otros métodos</div>
        </div>
      </div>

      {/* Botón de pago de Mercado Pago */}
      {preferenceId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Proceder al Pago
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Serás redirigido a Mercado Pago para completar tu pago de forma segura.
            </p>
            <Wallet
              initialization={{
                preferenceId: preferenceId
              }}
              onReady={() => console.log('Wallet ready')}
              onError={(error) => handlePaymentError(error)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MercadoPagoCheckout