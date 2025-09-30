import { createClient } from "@supabase/supabase-js";

// Cliente único de Supabase - instancia singleton
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true, // Permitir persistir sesión para JWT
      autoRefreshToken: false, // Clerk maneja el refresh
      detectSessionInUrl: false // No detectar sesión en URL
    }
  }
);

// Re-exportar la misma instancia para evitar múltiples clientes
export const supabaseAdmin = supabase;
