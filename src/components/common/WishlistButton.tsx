import React, { useEffect, useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { isInWishlist, addToWishlist, removeFromWishlist } from '@/lib/userProfile'
import { useNotificationHelpers } from '@/contexts/NotificationContext'
import { supabase } from '@/lib/supabase'

interface Props {
  productId: string
  className?: string
  productName?: string // Optional: para evitar fetch si ya tenemos el nombre
  showText?: boolean // Opcional: mostrar texto junto al icono
}

const WishlistButton: React.FC<Props> = ({ 
  productId, 
  className = '', 
  productName,
  showText = false 
}) => {
  const { user } = useUser()
  const { showWishlistAdded, showWishlistRemoved } = useNotificationHelpers()
  const [isWished, setIsWished] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false)
  const [sessionAvailable, setSessionAvailable] = useState<boolean | null>(null)
  const [cachedProductName, setCachedProductName] = useState<string>(productName || '')

  useEffect(() => {
    let mounted = true
    const fetchState = async () => {
      if (!user?.id) {
        setIsWished(false)
        setInitialLoaded(true)
        setSessionAvailable(true)
        return
      }

      setSessionAvailable(null)
      
      try {
        // 🎯 Simplemente intentar obtener el estado
        const res = await isInWishlist(user.id, productId)
        
        if (res.error === 'no_clerk_token') {
          // Token aún no disponible
          if (mounted) {
            setSessionAvailable(false)
            setInitialLoaded(false) // Esperamos token
          }
        } else {
          // Token disponible, tenemos respuesta
          if (mounted) {
            setSessionAvailable(true)
            setIsWished(!!res.isInWishlist)
            setInitialLoaded(true) // ✅ Estado cargado
          }
        }
      } catch (err) {
        console.error('Error checking wishlist state', err)
        if (mounted) {
          setSessionAvailable(false)
          setInitialLoaded(true) // Marcamos como cargado aunque haya error
        }
      }
    }
    fetchState()
    return () => { mounted = false }
  }, [user?.id, productId])

  // Fetch product name if not provided
  useEffect(() => {
    if (productName || cachedProductName) return
    
    const fetchProductName = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('nombre')
          .eq('id', productId)
          .single()
        
        if (!error && data) {
          setCachedProductName(data.nombre)
        }
      } catch (err) {
        console.error('Error fetching product name:', err)
      }
    }
    
    fetchProductName()
  }, [productId, productName, cachedProductName])

  const toggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user?.id) return
    if (loading) return
    
    // ✅ Solo prevenir si definitivamente no estamos listos
    if (!initialLoaded || sessionAvailable !== true) {
      console.warn('WishlistButton: toggle prevented — waiting for initial state', {
        initialLoaded,
        sessionAvailable
      })
      return
    }
    setLoading(true)
    const prev = isWished
    setIsWished(!prev)
    
    const displayName = productName || cachedProductName || 'Producto'
    
    try {
      if (!prev) {
        const res = await addToWishlist(user.id, productId)
        if (res.error) throw new Error(res.error)
        showWishlistAdded(displayName)
      } else {
        const res = await removeFromWishlist(user.id, productId)
        if (res.error) throw new Error(res.error)
        showWishlistRemoved(displayName)
      }
    } catch (err) {
      console.error('Wishlist toggle failed', err)
      setIsWished(prev)
    } finally {
      setLoading(false)
    }
  }, [user?.id, productId, isWished, loading, initialLoaded, sessionAvailable, productName, cachedProductName, showWishlistAdded, showWishlistRemoved])

  return (
    <button
      onClick={toggle}
      disabled={!user?.id || loading || sessionAvailable === null}
      aria-pressed={isWished}
      title={isWished ? 'Remover de lista de deseos' : 'Agregar a lista de deseos'}
      className={`${className} group/wishlist transition-all duration-300 ease-in-out hover:scale-110 hover:border-red-400 dark:hover:border-red-500 active:scale-95 disabled:hover:scale-100 disabled:opacity-50`}
    >
      <div className="flex items-center justify-center gap-2">
        <Heart 
          className={`
            w-5 h-5 
            transition-all duration-300 ease-in-out
            ${isWished 
              ? 'text-red-600 fill-red-600 dark:text-red-500 dark:fill-red-500' 
              : 'text-gray-400 dark:text-gray-500 group-hover/wishlist:text-red-400 dark:group-hover/wishlist:text-red-400 group-hover/wishlist:fill-red-100 dark:group-hover/wishlist:fill-red-900'
            }
            ${loading ? 'opacity-70' : 'opacity-100'}
          `} 
        />
        {showText && (
          <span className="text-sm font-medium">
            {isWished ? 'En lista de deseos' : 'Agregar a lista de deseos'}
          </span>
        )}
      </div>
    </button>
  )
}

export default WishlistButton
