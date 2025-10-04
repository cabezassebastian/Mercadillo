import React, { createContext, useContext, useEffect, useState } from 'react'
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
      const currentQuantity = existingItem ? existingItem.cantidad : 0
      
      // Verificar si hay stock suficiente
      if (currentQuantity + cantidad > producto.stock) {
        // Si ya hay stock en el carrito, no agregar más de lo disponible
        const maxCanAdd = producto.stock - currentQuantity
        if (maxCanAdd <= 0) {
          console.warn(`No hay más stock disponible para ${producto.nombre}`)
          return prevItems // No agregar nada
        }
        
        // Agregar solo la cantidad disponible
        console.warn(`Solo se pueden agregar ${maxCanAdd} unidades de ${producto.nombre}`)
        cantidad = maxCanAdd
      }
      
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
      prevItems.map(item => {
        if (item.producto.id === productoId) {
          // Verificar que la nueva cantidad no exceda el stock
          const newQuantity = Math.min(cantidad, item.producto.stock)
          
          if (newQuantity !== cantidad) {
            console.warn(`Stock limitado: solo hay ${item.producto.stock} unidades disponibles de ${item.producto.nombre}`)
          }
          
          return { ...item, cantidad: newQuantity }
        }
        return item
      })
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

  const getTotal = () => {
    return getSubtotal()
  }

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}


