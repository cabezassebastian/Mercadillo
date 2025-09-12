import { supabase } from "./supabaseClient";

// El cliente de Supabase ya está inicializado en supabaseClient.ts
// Se re-exporta para compatibilidad con módulos que aún lo importen directamente.
export { supabase };

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


