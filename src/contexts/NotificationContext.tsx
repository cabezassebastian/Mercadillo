import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actionLabel?: string
  actionHandler?: () => void
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000 // 5 segundos por defecto
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Helper hooks para tipos específicos de notificaciones
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications()

  return {
    showSuccess: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', title, message, ...options }),
    
    showError: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', title, message, duration: 7000, ...options }),
    
    showWarning: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', title, message, ...options }),
    
    showInfo: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', title, message, ...options }),

    // Notificaciones específicas para acciones del sistema
    showOrderSuccess: (orderNumber: string) =>
      addNotification({
        type: 'success',
        title: '¡Pedido realizado!',
        message: `Tu pedido #${orderNumber} ha sido procesado exitosamente.`,
        actionLabel: 'Ver pedido',
        actionHandler: () => window.location.href = `/profile/orders`
      }),

    showAddressAdded: () =>
      addNotification({
        type: 'success',
        title: 'Dirección guardada',
        message: 'Tu nueva dirección ha sido guardada exitosamente.'
      }),

    showAddressUpdated: () =>
      addNotification({
        type: 'success',
        title: 'Dirección actualizada',
        message: 'Los cambios en tu dirección han sido guardados.'
      }),

    showAddressDeleted: () =>
      addNotification({
        type: 'info',
        title: 'Dirección eliminada',
        message: 'La dirección ha sido eliminada de tu cuenta.'
      }),

    showWishlistAdded: (productName: string) =>
      addNotification({
        type: 'success',
        title: 'Agregado a favoritos',
        message: `${productName} ha sido agregado a tu lista de deseos.`,
        actionLabel: 'Ver lista',
        actionHandler: () => window.location.href = `/profile/wishlist`
      }),

    showWishlistRemoved: (productName: string) =>
      addNotification({
        type: 'info',
        title: 'Eliminado de favoritos',
        message: `${productName} ha sido eliminado de tu lista de deseos.`
      }),

    showCartAdded: (productName: string) =>
      addNotification({
        type: 'success',
        title: 'Agregado al carrito',
        message: `${productName} ha sido agregado a tu carrito.`,
        actionLabel: 'Ver carrito',
        actionHandler: () => window.location.href = `/cart`
      }),

    showReviewAdded: () =>
      addNotification({
        type: 'success',
        title: 'Reseña publicada',
        message: 'Tu reseña ha sido publicada exitosamente.'
      }),

    showReviewDeleted: () =>
      addNotification({
        type: 'info',
        title: 'Reseña eliminada',
        message: 'Tu reseña ha sido eliminada.'
      }),

    showPaymentError: (message?: string) =>
      addNotification({
        type: 'error',
        title: 'Error en el pago',
        message: message || 'Hubo un problema procesando tu pago. Por favor, intenta nuevamente.',
        duration: 10000
      })
  }
}