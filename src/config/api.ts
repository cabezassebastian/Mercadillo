/**
 * API Configuration
 * Centraliza todas las URLs de API para facilitar la migración de Vercel a Supabase Edge Functions
 */

// URLs base
const VERCEL_API_BASE = '/api'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xwubnuokmfghtyyfpgtl.supabase.co'
const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

// Feature flags para habilitar/deshabilitar funciones migradas
const USE_SUPABASE_FUNCTIONS = {
  products: true,    // ✅ Migrada - Fase 1
  orders: true,      // ✅ Migrada - Fase 1
  admin: true,       // ✅ Migrada - Incluye nuevos endpoints de variantes
  checkout: true,    // ✅ Migrada - Fase 2
  emails: true,      // ✅ Migrada - Fase 2
  mercadopago: true, // ✅ Migrada - Fase 2
  chat: true,        // ✅ Migrada - Fase 3
}

/**
 * API Endpoints
 * Las funciones migradas usan Supabase, las pendientes usan Vercel
 */
export const API_ENDPOINTS = {
  // ========== PRODUCTOS ==========
  /**
   * Obtener detalles de un producto (con opciones y variantes)
   * @param id - ID del producto
   */
  product: (id: string) => 
    USE_SUPABASE_FUNCTIONS.products
      ? `${SUPABASE_FUNCTIONS_URL}/products/${id}`
      : `${VERCEL_API_BASE}/products/${id}`,

  // ========== PEDIDOS ==========
  /**
   * Gestión de pedidos del usuario
   * GET: Obtener pedidos
   * POST: Crear nuevo pedido
   */
  orders: USE_SUPABASE_FUNCTIONS.orders
    ? `${SUPABASE_FUNCTIONS_URL}/orders`
    : `${VERCEL_API_BASE}/orders`,

  // ========== ADMIN ==========
  /**
   * Funciones administrativas
   * @param action - Acción a ejecutar (stats, orders, sales, metrics, etc)
   */
  admin: (action: string) =>
    USE_SUPABASE_FUNCTIONS.admin
      ? `${SUPABASE_FUNCTIONS_URL}/admin?action=${action}`
      : `${VERCEL_API_BASE}/admin/index?action=${action}`,

  // ========== CHECKOUT ========== (Pendiente migración - Fase 2)
  checkout: USE_SUPABASE_FUNCTIONS.checkout
    ? `${SUPABASE_FUNCTIONS_URL}/checkout`
    : `${VERCEL_API_BASE}/checkout`,

  // ========== EMAILS ========== (Pendiente migración - Fase 2)
  emails: USE_SUPABASE_FUNCTIONS.emails
    ? `${SUPABASE_FUNCTIONS_URL}/emails`
    : `${VERCEL_API_BASE}/emails/send`,

  // ========== MERCADO PAGO ========== (Pendiente migración - Fase 3)
  mercadopago: {
    createPreference: USE_SUPABASE_FUNCTIONS.mercadopago
      ? `${SUPABASE_FUNCTIONS_URL}/mercadopago-preference`
      : `${VERCEL_API_BASE}/mercadopago/create-preference`,
    
    webhook: USE_SUPABASE_FUNCTIONS.mercadopago
      ? `${SUPABASE_FUNCTIONS_URL}/mercadopago-webhook`
      : `${VERCEL_API_BASE}/mercadopago/webhook`,
  },

  // ========== CHAT ========== (Pendiente migración - Fase 3)
  chat: USE_SUPABASE_FUNCTIONS.chat
    ? `${SUPABASE_FUNCTIONS_URL}/chat`
    : `${VERCEL_API_BASE}/chat`,

  // ========== CLERK ========== (Mantener en Vercel)
  clerk: `${VERCEL_API_BASE}/clerk`,
}

/**
 * Headers comunes para peticiones
 */
export const getApiHeaders = (options?: {
  userId?: string
  adminSecret?: string
  contentType?: string
}) => {
  const headers: Record<string, string> = {}

  // Para funciones de Supabase
  const usingSupabase = Object.values(USE_SUPABASE_FUNCTIONS).some(v => v)
  if (usingSupabase) {
    headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }

  // User ID para autenticación
  if (options?.userId) {
    headers['x-user-id'] = options.userId
  }

  // Admin secret para funciones admin
  if (options?.adminSecret) {
    headers['x-admin-secret'] = options.adminSecret
  }

  // Content-Type
  if (options?.contentType) {
    headers['Content-Type'] = options.contentType
  } else {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

/**
 * Helper para hacer peticiones a las APIs
 */
export const fetchAPI = async <T = any>(
  url: string,
  options?: RequestInit & {
    userId?: string
    adminSecret?: string
  }
): Promise<T> => {
  const { userId, adminSecret, ...fetchOptions } = options || {}

  const headers = {
    ...getApiHeaders({ userId, adminSecret }),
    ...fetchOptions.headers,
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Configuración de migración
 * Para debug y monitoreo
 */
export const MIGRATION_STATUS = {
  phase1: {
    status: 'completed',
    functions: ['products', 'orders', 'admin'],
    migratedAt: '2025-11-01',
  },
  phase2: {
    status: 'completed',
    functions: ['checkout', 'emails', 'mercadopago-preference', 'mercadopago-webhook'],
    migratedAt: '2025-11-02',
  },
  phase3: {
    status: 'completed',
    functions: ['chat'],
    migratedAt: '2025-11-02',
  },
  totalFunctions: 8,
  migratedFunctions: 8,
  progress: '100%',
}

// Log de configuración en desarrollo
if (import.meta.env.DEV) {
  console.log('📡 API Configuration:')
  console.log('  - Supabase Functions:', SUPABASE_FUNCTIONS_URL)
  console.log('  - Vercel API:', VERCEL_API_BASE)
  console.log('  - Migration Progress:', MIGRATION_STATUS.progress)
  console.log('  - Active Supabase Functions:', 
    Object.entries(USE_SUPABASE_FUNCTIONS)
      .filter(([, v]) => v)
      .map(([k]) => k)
  )
}
