/**
 * Admin API Helper
 * Centraliza las llamadas a la Edge Function de admin con autenticación
 */

import { API_ENDPOINTS } from '../config/api'

// Admin secret desde variables de entorno
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

/**
 * Fetch admin endpoint con autenticación automática
 */
export const fetchAdmin = async <T = any>(
  action: string,
  options?: RequestInit
): Promise<T> => {
  const url = API_ENDPOINTS.admin(action)
  
  const headers = {
    'Content-Type': 'application/json',
    'x-admin-secret': ADMIN_SECRET,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    ...options?.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}
