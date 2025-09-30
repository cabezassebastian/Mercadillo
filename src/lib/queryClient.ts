import { QueryClient } from '@tanstack/react-query'

// Configuración del QueryClient con cache inteligente
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache durante 5 minutos por defecto
      staleTime: 5 * 60 * 1000,
      // Mantener cache durante 10 minutos sin uso
      gcTime: 10 * 60 * 1000,
      // Retry automático en caso de error
      retry: 2,
      // Refetch automático cuando se enfoca la ventana
      refetchOnWindowFocus: false,
      // Refetch automático cuando se reconecta
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations en caso de error de red
      retry: 1,
    },
  },
})

// Query Keys para organizar el cache
export const queryKeys = {
  // Productos
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
  },
  // Reviews
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (productId: string) => [...queryKeys.reviews.lists(), productId] as const,
    stats: () => [...queryKeys.reviews.all, 'stats'] as const,
    stat: (productId: string) => [...queryKeys.reviews.stats(), productId] as const,
  },
  // Usuario
  user: {
    all: ['user'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
    addresses: (userId: string) => [...queryKeys.user.all, 'addresses', userId] as const,
    history: (userId: string) => [...queryKeys.user.all, 'history', userId] as const,
    wishlist: (userId: string) => [...queryKeys.user.all, 'wishlist', userId] as const,
  },
  // Órdenes
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.orders.lists(), userId] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (orderId: string) => [...queryKeys.orders.details(), orderId] as const,
  },
} as const

// Configuraciones específicas por tipo de query
export const queryOptions = {
  // Datos que cambian frecuentemente (carrito, stock)
  realtime: {
    staleTime: 0,
    gcTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Cada 30 segundos
  },
  // Datos que cambian poco (productos, categorías)
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false,
  },
  // Datos de usuario (perfil, direcciones)
  user: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: true,
  },
} as const