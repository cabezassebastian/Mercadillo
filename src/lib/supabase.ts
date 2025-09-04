import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

// Tipos para la base de datos
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

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  telefono?: string
  direccion?: string
  rol: 'cliente' | 'admin'
  created_at: string
}


