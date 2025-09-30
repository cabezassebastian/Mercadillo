import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys, queryOptions } from '@/lib/queryClient'
import { 
  getUserAddresses, 
  getUserNavigationHistory
} from '@/lib/userProfile'

// Hook para obtener direcciones de usuario con cache
export const useUserAddresses = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.user.addresses(userId),
    queryFn: async () => {
      const result = await getUserAddresses(userId)
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data || []
    },
    ...queryOptions.user,
    enabled: !!userId,
  })
}

// Hook para obtener historial de navegación con cache
export const useUserHistory = (userId: string, limit = 50) => {
  return useQuery({
    queryKey: [...queryKeys.user.history(userId), limit],
    queryFn: async () => {
      const result = await getUserNavigationHistory(userId, limit)
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data || []
    },
    ...queryOptions.user,
    enabled: !!userId,
  })
}

// Hook para mutaciones de usuario
export const useUserMutations = () => {
  const queryClient = useQueryClient()

  const invalidateUserProfile = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(userId) })
  }

  const invalidateUserAddresses = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses(userId) })
  }

  const invalidateUserHistory = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.history(userId) })
  }

  const invalidateAllUserData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
  }

  return {
    invalidateUserProfile,
    invalidateUserAddresses,
    invalidateUserHistory,
    invalidateAllUserData,
  }
}