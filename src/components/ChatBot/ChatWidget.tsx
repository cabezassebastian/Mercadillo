import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import ChatMessage from './ChatMessage'
import { useUser } from '@clerk/clerk-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: any[]
}

const ChatWidget: React.FC = () => {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cargar historial del localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('mercadillo-chat-history')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    } else {
      // Mensaje de bienvenida inicial
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! 👋 Soy el asistente virtual de Mercadillo. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      }])
    }
  }, [])

  // Guardar historial en localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mercadillo-chat-history', JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-5), // Enviar últimos 5 mensajes para contexto
          userId: user?.id,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Error al obtener respuesta')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        products: data.products // Incluir productos si existen
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Incrementar contador de no leídos si el chat está cerrado
      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres borrar el historial de chat?')) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! 👋 Soy el asistente virtual de Mercadillo. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      }])
      localStorage.removeItem('mercadillo-chat-history')
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setUnreadCount(0) // Resetear contador al abrir
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-amarillo hover:bg-yellow-500 text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Badge de mensajes no leídos */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          
          {/* Ping animation solo si no hay mensajes no leídos */}
          {unreadCount === 0 && (
            <>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </>
          )}
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-amarillo text-gray-900 p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-amarillo" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente Mercadillo</h3>
                <p className="text-xs text-gray-800">En línea</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-900 hover:text-gray-700 transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Escribiendo...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-amarillo text-gray-900 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar mensaje"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-2"
            >
              Borrar historial
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget
