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
        console.log('🔐 Fetch Interceptor: Got token?', !!token, 'for URL:', url.substring(0, 100))
        if (token) {
          // Inyectar el token de Clerk
          const headers = new Headers(init?.headers)
          headers.set('Authorization', `Bearer ${token}`)
          
          // 🔍 Log el JWT payload para ver qué usuario_id tiene
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            console.log('🎫 JWT Payload - sub:', payload.sub, 'user_metadata:', payload.user_metadata)
          } catch (e) {}
          
          const response = await originalFetch(input, {
            ...init,
            headers
          })
          
          // 🔍 Log respuesta
          if (!response.ok) {
            const clonedResponse = response.clone()
            clonedResponse.text().then(text => {
              console.error('❌ Supabase Error Response:', {
                status: response.status,
                statusText: response.statusText,
                body: text.substring(0, 500),
                url: url.substring(0, 100)
              })
            })
          } else {
            console.log('✅ Supabase request OK:', url.substring(0, 100))
          }
          
          return response
        }
      } catch (e) {
        console.error('❌ Fetch interceptor error:', e)
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
