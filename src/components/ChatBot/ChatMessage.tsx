import React from 'react'
import { Bot, User, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useNotificationHelpers } from '../../contexts/NotificationContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: any[]
}

interface ChatMessageProps {
  message: Message
}

// Función para convertir URLs en enlaces clickeables
const linkify = (text: string) => {
  // Regex para detectar URLs (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      // Es una URL
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'
  const { addToCart } = useCart()
  const { showSuccess } = useNotificationHelpers()

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagen_url,
      descripcion: product.descripcion || '',
      stock: product.stock,
      categoria: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, 1)
    showSuccess('Producto agregado', `${product.nombre} agregado al carrito`)
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex items-start space-x-2 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-amarillo text-gray-900'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Mensaje y Productos */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-blue-500 text-white rounded-tr-none'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-tl-none'
          }`}>
            <p className="text-sm whitespace-pre-wrap break-words">
              {isUser ? message.content : linkify(message.content)}
            </p>
          </div>

          {/* Productos encontrados */}
          {message.products && message.products.length > 0 && (
            <div className="mt-2 space-y-2 w-full max-w-sm">
              {message.products.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex gap-3">
                    <Link to={`/producto/${product.id}`} className="flex-shrink-0">
                      <img 
                        src={product.imagen_url} 
                        alt={product.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/producto/${product.id}`}
                        className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                      >
                        {product.nombre}
                      </Link>
                      <p className="text-lg font-bold text-amarillo mt-1">
                        S/ {product.precio.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-amarillo text-gray-900 py-1.5 px-3 rounded-md hover:bg-yellow-500 transition-colors text-sm font-medium"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString('es-PE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
