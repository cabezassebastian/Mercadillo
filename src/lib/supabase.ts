import { supabase } from "./supabaseClient";
import { createClient } from "@supabase/supabase-js";

// El cliente de Supabase ya está inicializado en supabaseClient.ts
// Se re-exporta para compatibilidad con módulos que aún lo importen directamente.
export { supabase };

// Cliente administrativo para operaciones que requieren privilegios elevados
// Solo usar cuando sea absolutamente necesario
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  stock: number
  categoria: string
  created_at: string
  updated_at: string
}

export interface Pedido {
  id: string
  usuario_id: string
  items: PedidoItem[]
  subtotal: number
  igv: number
  total: number
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado'
  fecha: string
  direccion_envio: string
  metodo_pago: string
  created_at: string
}

export interface PedidoItem {
  producto_id: string
  cantidad: number
  precio: number
  nombre: string
  imagen: string
}


