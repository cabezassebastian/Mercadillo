import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para operaciones de ADMINISTRADOR
// Usa Service Role Key que bypasea RLS
// SOLO usar en componentes de admin protegidos

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for admin client')
}

// ⚠️ IMPORTANTE: Este cliente se crea SOLO cuando se importa en componentes de admin
// Para evitar múltiples instancias, no lo importes en código regular
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-admin' // Identificador para debugging
    }
  }
})
