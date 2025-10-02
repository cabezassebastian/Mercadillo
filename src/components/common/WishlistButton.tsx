import React, { useEffect, useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { isInWishlist, addToWishlist, removeFromWishlist, ensureSupabaseSession } from '@/lib/userProfile'

interface Props {
  productId: string
  className?: string
}

const WishlistButton: React.FC<Props> = ({ productId, className = '' }) => {
  const { user } = useUser()
  const [isWished, setIsWished] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false)
  const [sessionAvailable, setSessionAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchState = async () => {
      if (!user?.id) {
        setIsWished(false)
        setInitialLoaded(true)
        return
      }
      // Wait for a shared global supabase session (Clerk -> Supabase propagation)
      setSessionAvailable(null)
      const ok = await ensureSupabaseSession()
      if (!mounted) return
      if (!ok) {
        console.warn('isInWishlist: No supabase session available (timeout)')
        setSessionAvailable(false)
        setInitialLoaded(true)
        return
      }

      setSessionAvailable(true)
      try {
        const res = await isInWishlist(user.id, productId)
        if (mounted) setIsWished(!!res.isInWishlist)
      } catch (err) {
        console.error('Error checking wishlist state', err)
      } finally {
        if (mounted) setInitialLoaded(true)
      }
    }
    fetchState()
    return () => { mounted = false }
  }, [user?.id, productId])

  const toggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user?.id) return
    // prevent toggle before initial server-state has been fetched or session ready
    if (!initialLoaded) {
      console.warn('WishlistButton: toggle prevented — initial wishlist state not loaded yet')
      return
    }
    if (sessionAvailable === false) {
      console.warn('WishlistButton: toggle prevented — supabase session not available')
      return
    }
  if (loading) return
    setLoading(true)
    const prev = isWished
    setIsWished(!prev)
    try {
      if (!prev) {
        const res = await addToWishlist(user.id, productId)
        if (res.error) throw new Error(res.error)
      } else {
        const res = await removeFromWishlist(user.id, productId)
        if (res.error) throw new Error(res.error)
      }
    } catch (err) {
      console.error('Wishlist toggle failed', err)
      setIsWished(prev)
    } finally {
      setLoading(false)
    }
  }, [user?.id, productId, isWished, loading])

  return (
    <button
      onClick={toggle}
      disabled={!user?.id || loading || sessionAvailable === null}
      aria-pressed={isWished}
      title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
      className={className}
    >
      {sessionAvailable === null || loading ? (
        <span className="w-5 h-5 inline-block animate-pulse bg-gray-200 rounded" />
      ) : (
        <Heart className={`w-5 h-5 ${isWished ? 'text-red-600' : 'text-gray-600'}`} />
      )}
    </button>
  )
}

export default WishlistButton
