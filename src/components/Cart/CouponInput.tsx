import React, { useState } from 'react'
import { Ticket, X, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@clerk/clerk-react'

const CouponInput: React.FC = () => {
  const { user } = useUser()
  const { aplicarCupon, removerCupon, cuponAplicado } = useCart()
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null)

  const handleAplicar = async () => {
    if (!user) {
      setMensaje({ tipo: 'error', texto: 'Debes iniciar sesión para usar cupones' })
      return
    }

    if (!codigo.trim()) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un código de cupón' })
      return
    }

    setLoading(true)
    setMensaje(null)

    const resultado = await aplicarCupon(codigo, user.id)

    setLoading(false)

    if (resultado.valido) {
      setMensaje({ tipo: 'success', texto: resultado.mensaje })
      setCodigo('')
    } else {
      setMensaje({ tipo: 'error', texto: resultado.mensaje })
    }
  }

  const handleRemover = () => {
    removerCupon()
    setCodigo('')
    setMensaje(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Ticket className="w-5 h-5 text-dorado dark:text-yellow-400" />
        <h3 className="font-semibold text-gris-oscuro dark:text-gray-100">
          Cupón de Descuento
        </h3>
      </div>

      {!cuponAplicado?.valido ? (
        <div className="flex space-x-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleAplicar()}
            placeholder="Código de cupón"
            className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-dorado focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
            disabled={loading}
          />
          <button
            onClick={handleAplicar}
            disabled={loading || !codigo.trim()}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Validando...' : 'Aplicar'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <span className="font-medium text-green-700 dark:text-green-400 block">
                {codigo || 'Cupón aplicado'}
              </span>
              <span className="text-xs text-green-600 dark:text-green-500">
                {cuponAplicado.tipo === 'porcentaje' 
                  ? `${cuponAplicado.valor}% de descuento` 
                  : `S/ ${cuponAplicado.valor} de descuento`}
              </span>
            </div>
          </div>
          <button
            onClick={handleRemover}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Remover cupón"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {mensaje && (
        <div className={`text-sm ${mensaje.tipo === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Los cupones se aplican automáticamente al total de la compra
      </div>
    </div>
  )
}

export default CouponInput
