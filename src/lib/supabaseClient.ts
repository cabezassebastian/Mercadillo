import { createClient } from "@supabase/supabase-js";

// 🔑 Interceptar fetch para inyectar el token de Clerk automáticamente
const originalFetch = window.fetch
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  
  // Solo interceptar peticiones a Supabase
  if (url.includes(import.meta.env.VITE_SUPABASE_URL)) {
    const getToken = (window as any).__getClerkToken
    if (typeof getToken === 'function') {
      try {
        const token = await getToken()
        if (token) {
          // Inyectar el token de Clerk
          const headers = new Headers(init?.headers)
          headers.set('Authorization', `Bearer ${token}`)
          
          return originalFetch(input, {
            ...init,
            headers
          })
        }
      } catch (e) {
        // Si falla, continuar con la petición normal
      }
    }
  }
  
  return originalFetch(input, init)
}

// Cliente único de Supabase - instancia singleton
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false, // No persistir - usamos el token de Clerk
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Re-exportar la misma instancia para evitar múltiples clientes
export const supabaseAdmin = supabase;
