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
}

const WishlistButton: React.FC<Props> = ({ productId, className = '', productName }) => {
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
      title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`${className} group transition-transform duration-200 ease-out hover:scale-110 active:scale-95 disabled:hover:scale-100`}
    >
      <Heart 
        className={`
          w-5 h-5 
          transition-all duration-300 ease-in-out
          ${isWished 
            ? 'text-red-600 fill-red-600' 
            : 'text-gray-400 group-hover:text-red-400 group-hover:fill-red-100'
          }
          ${loading ? 'opacity-70' : 'opacity-100'}
        `} 
      />
    </button>
  )
}

export default WishlistButton
