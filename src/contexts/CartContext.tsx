import React, { createContext, useContext, useEffect, useState } from 'react'
import { Producto } from '@/lib/supabase'
import { validarCupon, type ValidacionCupon } from '@/lib/cupones'

export interface CartItem {
  producto: Producto & { variant_id?: string; variant_label?: string }
  cantidad: number
}

interface CartContextType {
  items: CartItem[]
  cuponAplicado: ValidacionCupon | null
  addToCart: (producto: Producto & { variant_id?: string; variant_label?: string }, cantidad?: number) => void
  removeFromCart: (productoId: string, variantId?: string) => void
  updateQuantity: (productoId: string, cantidad: number, variantId?: string) => void
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

  const addToCart = (producto: Producto & { variant_id?: string; variant_label?: string }, cantidad: number = 1) => {
    setItems(prevItems => {
      // treat same product+variant as same item
      const existingItem = prevItems.find(item => item.producto.id === producto.id && (item.producto.variant_id || '') === (producto.variant_id || ''))
      const currentQuantity = existingItem ? existingItem.cantidad : 0

      // Verificar si hay stock suficiente (producto.stock puede ser null)
      const prodStock = producto.stock ?? 0
      if (currentQuantity + cantidad > prodStock) {
        const maxCanAdd = prodStock - currentQuantity
        if (maxCanAdd <= 0) {
          console.warn(`No hay más stock disponible para ${producto.nombre}${producto.variant_label ? ' ('+producto.variant_label+')' : ''}`)
          return prevItems
        }
        console.warn(`Solo se pueden agregar ${maxCanAdd} unidades de ${producto.nombre}${producto.variant_label ? ' ('+producto.variant_label+')' : ''}`)
        cantidad = maxCanAdd
      }

      if (existingItem) {
        return prevItems.map(item =>
          item.producto.id === producto.id && (item.producto.variant_id || '') === (producto.variant_id || '')
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      } else {
        return [...prevItems, { producto, cantidad }]
      }
    })
  }

  // remove by product id and optional variant id
  const removeFromCart = (productoId: string, variantId?: string) => {
    setItems(prevItems => prevItems.filter(item => !(item.producto.id === productoId && (variantId ? (item.producto.variant_id || '') === variantId : true))))
  }

  const updateQuantity = (productoId: string, cantidad: number, variantId?: string) => {
    if (cantidad <= 0) {
      removeFromCart(productoId, variantId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.producto.id === productoId && (variantId ? (item.producto.variant_id || '') === variantId : true)) {
          // Verificar que la nueva cantidad no exceda el stock (item.producto.stock puede ser null)
          const itemStock = item.producto.stock ?? 0
          const newQuantity = Math.min(cantidad, itemStock)

          if (newQuantity !== cantidad) {
            console.warn(`Stock limitado: solo hay ${itemStock} unidades disponibles de ${item.producto.nombre}${item.producto.variant_label ? ' ('+item.producto.variant_label+')' : ''}`)
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


