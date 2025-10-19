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
        let token = await getToken()
        // Prepare headers
        const originalHeaders = (input instanceof Request) ? input.headers : init?.headers
        const headers = new Headers(originalHeaders)
        if (!headers.has('Accept')) headers.set('Accept', 'application/json')

        if (token) headers.set('Authorization', `Bearer ${token}`)

        let response = await originalFetch(input, { ...init, headers })

        // If auth failed, try once to refresh token and retry the request
        if ((response.status === 401 || response.status === 403) && typeof getToken === 'function') {
          try {
            // force a fresh token by clearing cached getter if available
            if ((window as any).__clearClerkTokenCache) (window as any).__clearClerkTokenCache()
            token = await getToken()
            if (token) {
              const retryHeaders = new Headers(originalHeaders)
              if (!retryHeaders.has('Accept')) retryHeaders.set('Accept', 'application/json')
              retryHeaders.set('Authorization', `Bearer ${token}`)
              response = await originalFetch(input, { ...init, headers: retryHeaders })
            }
          } catch (e) {
            // swallow retry errors, we'll return original response below
            console.warn('Fetch interceptor retry failed:', e)
          }
        }

        // Log only server errors; show a light warning for auth issues to help debugging
        if (!response.ok) {
          if (response.status >= 500) {
            const clonedResponse = response.clone()
            clonedResponse.text().then(text => {
              console.error('❌ Supabase Error:', {
                status: response.status,
                statusText: response.statusText,
                body: text.substring(0, 200),
                url: url.substring(0, 80)
              })
            })
          } else if (response.status === 401 || response.status === 403) {
            console.warn('⚠️ Supabase auth failed (401/403). Token may be expired.')
          }
        }

        return response
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

// Note: don't export an "admin" alias here — admin client should be created
// explicitly from `supabaseAdmin.ts` (service role). This avoids multiple
// Supabase client instances being created in the browser which can trigger
// the "Multiple GoTrueClient instances detected" warning.
