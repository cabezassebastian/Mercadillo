import React, { useEffect, useState } from 'react'
import { useNotifications, type Notification } from '@/contexts/NotificationContext'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => onRemove(notification.id), 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getStyles = () => {
    const baseStyles = "border-l-4 shadow-lg rounded-lg p-4 mb-4 transition-all duration-300 ease-in-out transform"
    
    if (isRemoving) {
      return `${baseStyles} translate-x-full opacity-0`
    }
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`
    }

    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-500 translate-x-0 opacity-100`
      case 'error':
        return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-500 translate-x-0 opacity-100`
      case 'warning':
        return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 translate-x-0 opacity-100`
      case 'info':
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-500 translate-x-0 opacity-100`
      default:
        return `${baseStyles} bg-gray-50 dark:bg-gray-900/20 border-gray-500 translate-x-0 opacity-100`
    }
  }

  return (
    <div className={getStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {notification.message}
          </p>
          {notification.actionLabel && notification.actionHandler && (
            <button
              onClick={notification.actionHandler}
              className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {notification.actionLabel}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  )
}

export default NotificationContainer