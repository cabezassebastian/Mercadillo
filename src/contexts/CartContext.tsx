import React, { createContext, useContext, useEffect, useState } from 'react'
import { Producto } from '@/lib/supabase'
import { validarCupon, type ValidacionCupon } from '@/lib/cupones'

export interface CartItem {
  producto: Producto
  cantidad: number
}

interface CartContextType {
  items: CartItem[]
  cuponAplicado: ValidacionCupon | null
  addToCart: (producto: Producto, cantidad?: number) => void
  removeFromCart: (productoId: string) => void
  updateQuantity: (productoId: string, cantidad: number) => void
  clearCart: () => void
  aplicarCupon: (codigo: string, usuarioId: string) => Promise<ValidacionCupon>
  removerCupon: () => void
  getTotalItems: () => number
  getSubtotal: () => number
  getDescuento: () => number
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
  const [cuponAplicado, setCuponAplicado] = useState<ValidacionCupon | null>(null)

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
      
      // Verificar si hay stock suficiente (producto.stock puede ser null)
      const prodStock = producto.stock ?? 0
      if (currentQuantity + cantidad > prodStock) {
        // Si ya hay stock en el carrito, no agregar más de lo disponible
        const maxCanAdd = prodStock - currentQuantity
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
          // Verificar que la nueva cantidad no exceda el stock (item.producto.stock puede ser null)
          const itemStock = item.producto.stock ?? 0
          const newQuantity = Math.min(cantidad, itemStock)

          if (newQuantity !== cantidad) {
            console.warn(`Stock limitado: solo hay ${itemStock} unidades disponibles de ${item.producto.nombre}`)
          }

          return { ...item, cantidad: newQuantity }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
    setCuponAplicado(null) // Limpiar cupón también
  }

  const aplicarCupon = async (codigo: string, usuarioId: string): Promise<ValidacionCupon> => {
    const subtotal = getSubtotal()
    const resultado = await validarCupon(codigo, usuarioId, subtotal)
    
    if (resultado.valido) {
      setCuponAplicado(resultado)
    }
    
    return resultado
  }

  const removerCupon = () => {
    setCuponAplicado(null)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.cantidad, 0)
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0)
  }

  const getDescuento = () => {
    return cuponAplicado?.descuento || 0
  }

  const getTotal = () => {
    return getSubtotal() - getDescuento()
  }

  const value: CartContextType = {
    items,
    cuponAplicado,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    aplicarCupon,
    removerCupon,
    getTotalItems,
    getSubtotal,
    getDescuento,
    getTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}


