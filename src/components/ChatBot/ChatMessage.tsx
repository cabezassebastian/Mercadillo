import React from 'react'
import { Bot, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'

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

        {/* Mensaje */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-blue-500 text-white rounded-tr-none'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-tl-none'
          }`}>
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
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
