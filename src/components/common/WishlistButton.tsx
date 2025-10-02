import React, { useEffect, useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { isInWishlist, addToWishlist, removeFromWishlist } from '@/lib/userProfile'

interface Props {
  productId: string
  className?: string
}

const WishlistButton: React.FC<Props> = ({ productId, className = '' }) => {
  const { user } = useUser()
  const [isWished, setIsWished] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    const fetchState = async () => {
      if (!user?.id) {
        setIsWished(false)
        return
      }
      try {
        const res = await isInWishlist(user.id, productId)
        if (mounted) setIsWished(!!res.isInWishlist)
      } catch (err) {
        console.error('Error checking wishlist state', err)
      }
    }
    fetchState()
    return () => { mounted = false }
  }, [user?.id, productId])

  const toggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user?.id) return
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
      disabled={!user?.id || loading}
      aria-pressed={isWished}
      title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
      className={className}
    >
      <Heart className={`w-5 h-5 ${isWished ? 'text-red-600' : 'text-gray-600'}`} />
    </button>
  )
}

export default WishlistButton
