import { supabase } from "./supabaseClient";

// El cliente de Supabase ya está inicializado en supabaseClient.ts
// Se re-exporta para compatibilidad con módulos que aún lo importen directamente.
export { supabase };

// Re-exportar la misma instancia para evitar múltiples clientes
export { supabase as supabaseAdmin } from "./supabaseClient";

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  stock: number | null
  categoria: string
  created_at: string
  updated_at: string
  rating_promedio?: number  // Promedio de calificaciones 0-5
  total_vendidos?: number   // Total de unidades vendidas
}

export interface ProductOption {
  id: string
  product_id: string
  name: string
  position?: number
  created_at?: string
}

export interface ProductOptionValue {
  id: string
  option_id: string
  value: string
  position?: number
  metadata?: any
  created_at?: string
}

export interface ProductVariant {
  id: string
  product_id: string
  sku?: string | null
  price?: number | null
  stock?: number | null
  is_active?: boolean
  attributes?: any
  option_value_ids?: string[]
  created_at?: string
}

export interface ProductoImagen {
  id: string
  producto_id: string
  url: string
  orden: number
  es_principal: boolean
  alt_text?: string
  created_at: string
  updated_at: string
}

export interface Pedido {
  id: string
  usuario_id: string
  items: PedidoItem[]
  subtotal: number
  total: number
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado'
  fecha: string
  direccion_envio: string
  metodo_pago: string
  created_at: string
  // Campos de entrega
  metodo_entrega?: 'envio' | 'contraentrega' | 'tienda'
  telefono_contacto?: string
  dni_cliente?: string
  nombre_completo?: string
  notas_entrega?: string
}

export interface PedidoItem {
  producto_id: string
  cantidad: number
  precio: number
  nombre: string
  imagen: string
}