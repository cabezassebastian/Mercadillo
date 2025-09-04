import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Producto } from '@/lib/supabase'

export interface CartItem {
  producto: Producto
  cantidad: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (producto: Producto, cantidad?: number) => void
  removeFromCart: (productoId: string) => void
  updateQuantity: (productoId: string, cantidad: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getSubtotal: () => number
  getIGV: () => number
  getTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser()
  const [items, setItems] = useState<CartItem[]>([])

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('mercadillo-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('mercadillo-cart', JSON.stringify(items))
  }, [items])

  const addToCart = (producto: Producto, cantidad: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.producto.id === producto.id)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      } else {
        return [...prevItems, { producto, cantidad }]
      }
    })
  }

  const removeFromCart = (productoId: string) => {
    setItems(prevItems => prevItems.filter(item => item.producto.id !== productoId))
  }

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.producto.id === productoId
          ? { ...item, cantidad }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.cantidad, 0)
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0)
  }

  const getIGV = () => {
    return getSubtotal() * 0.18 // 18% IGV
  }

  const getTotal = () => {
    return getSubtotal() + getIGV()
  }

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getIGV,
    getTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}


