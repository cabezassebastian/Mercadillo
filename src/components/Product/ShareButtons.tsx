import React, { useState } from 'react'
import { Share2, MessageCircle, Facebook, Twitter, Check, Copy } from 'lucide-react'

interface ShareButtonsProps {
  productName: string
  productPrice: number
  productUrl: string
  productImage?: string
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  productName,
  productPrice,
  productUrl,
  productImage
}) => {
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Formatear precio en soles peruanos
  const formattedPrice = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(productPrice)

  // URL completa del producto
  const fullUrl = `https://mercadillo.app${productUrl}`

  // Mensajes personalizados para Mercadillo Lima Perú
  const messages = {
    whatsapp: `¡Mira este producto en Mercadillo! 🛍️\n\n*${productName}*\n${formattedPrice}\n\n✨ Lo mejor de Lima, Perú en un solo lugar.\n\nVer producto: ${fullUrl}`,
    
    facebook: `¡Encontré esto en Mercadillo! 🇵🇪\n\n${productName} - ${formattedPrice}\n\nDescubre los mejores productos de Lima, Perú 🛍️✨`,
    
    twitter: `¡Increíble! ${productName} por ${formattedPrice} en @MercadilloLima 🇵🇪✨\n\n#MercadilloPerú #CompraLocal #Lima`,
    
    pinterest: `${productName} - ${formattedPrice}\n\nEncuentra este y más productos increíbles en Mercadillo, tu tienda online de confianza en Lima, Perú 🇵🇪`,
    
    generic: `¡Descubre ${productName} por ${formattedPrice} en Mercadillo! 🛍️\n\nTu tienda online favorita de Lima, Perú.\n\n${fullUrl}`
  }

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(messages.whatsapp)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(messages.facebook)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}&url=${encodeURIComponent(fullUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  const shareToPinterest = () => {
    const imageUrl = productImage || 'https://mercadillo.app/og-image.jpg'
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(fullUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(messages.pinterest)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=750,height=550')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${messages.generic}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
      // Fallback para navegadores sin soporte de clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = `${messages.generic}`
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err2) {
        console.error('Fallback copy failed:', err2)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-amarillo dark:border-yellow-500 text-gris-oscuro dark:text-gray-100 rounded-lg hover:bg-amarillo hover:text-white dark:hover:bg-yellow-500 dark:hover:text-gray-900 transition-all duration-200 shadow-sm"
        aria-label="Compartir producto"
      >
        <Share2 className="w-5 h-5" />
        <span className="font-medium">Compartir</span>
      </button>

      {/* Menú desplegable */}
      {showMenu && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menú */}
          <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-3 bg-amarillo dark:bg-yellow-500 text-white dark:text-gray-900 font-semibold text-sm">
              🇵🇪 Comparte desde Mercadillo
            </div>
            
            <div className="py-2">
              {/* WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-150"
              >
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div className="text-left flex-1">
                  <div className="font-medium text-gris-oscuro dark:text-gray-100">WhatsApp</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Comparte por mensaje</div>
                </div>
              </button>

              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
              >
                <Facebook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-left flex-1">
                  <div className="font-medium text-gris-oscuro dark:text-gray-100">Facebook</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Comparte en tu muro</div>
                </div>
              </button>

              {/* Twitter/X */}
              <button
                onClick={shareToTwitter}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <Twitter className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                <div className="text-left flex-1">
                  <div className="font-medium text-gris-oscuro dark:text-gray-100">Twitter/X</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Publica un tweet</div>
                </div>
              </button>

              {/* Pinterest */}
              <button
                onClick={shareToPinterest}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
              >
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
                <div className="text-left flex-1">
                  <div className="font-medium text-gris-oscuro dark:text-gray-100">Pinterest</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Guarda en tablero</div>
                </div>
              </button>

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Copiar link */}
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-amarillo/10 dark:hover:bg-yellow-500/10 transition-colors duration-150"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-amarillo dark:text-yellow-500" />
                )}
                <div className="text-left flex-1">
                  <div className="font-medium text-gris-oscuro dark:text-gray-100">
                    {copied ? '¡Copiado!' : 'Copiar enlace'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {copied ? 'Link copiado al portapapeles' : 'Compartir por otro medio'}
                  </div>
                </div>
              </button>
            </div>

            {/* Footer con marca */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 text-center text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
              ✨ Mercadillo • Lima, Perú 🇵🇪
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ShareButtons
