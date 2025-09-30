import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys, queryOptions } from '@/lib/queryClient'
import { getProductReviewStats } from '@/lib/reviews'
import { supabase, type Producto } from '@/lib/supabase'

// Hook para obtener estadísticas de reviews con cache
export const useProductReviewStats = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.reviews.stat(productId),
    queryFn: () => getProductReviewStats(productId),
    ...queryOptions.static, // Cache por 30 minutos
    enabled: !!productId,
  })
}

// Hook para obtener productos con cache
export const useProducts = (filters?: {
  categoria?: string
  busqueda?: string
  ordenar?: 'precio_asc' | 'precio_desc' | 'nombre' | 'fecha'
  limite?: number
}) => {
  return useQuery({
    queryKey: queryKeys.products.list(filters || {}),
    queryFn: async () => {
      let query = supabase
        .from('productos')
        .select('*')

      // Aplicar filtros
      if (filters?.categoria && filters.categoria !== 'all') {
        query = query.eq('categoria', filters.categoria)
      }

      if (filters?.busqueda) {
        query = query.or(`nombre.ilike.%${filters.busqueda}%,descripcion.ilike.%${filters.busqueda}%`)
      }

      // Aplicar ordenamiento
      switch (filters?.ordenar) {
        case 'precio_asc':
          query = query.order('precio', { ascending: true })
          break
        case 'precio_desc':
          query = query.order('precio', { ascending: false })
          break
        case 'nombre':
          query = query.order('nombre', { ascending: true })
          break
        case 'fecha':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      if (filters?.limite) {
        query = query.limit(filters.limite)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      return data as Producto[]
    },
    ...queryOptions.static,
  })
}

// Hook para obtener un producto específico
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data as Producto
    },
    ...queryOptions.static,
    enabled: !!productId,
  })
}

// Hook para búsqueda de productos con cache
export const useProductSearch = (query: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: async () => {
      if (!query.trim()) return []

      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
        .limit(20)

      if (error) {
        throw new Error(error.message)
      }

      return data as Producto[]
    },
    ...queryOptions.static,
    enabled: enabled && query.trim().length > 0,
  })
}

// Hook para invalidar caches de productos
export const useProductMutations = () => {
  const queryClient = useQueryClient()

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  }

  const invalidateProduct = (productId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) })
  }

  const invalidateReviewStats = (productId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.stat(productId) })
  }

  return {
    invalidateProducts,
    invalidateProduct,
    invalidateReviewStats,
  }
}