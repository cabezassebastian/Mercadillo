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
  stock: number
  categoria: string
  created_at: string
  updated_at: string
  rating_promedio?: number  // Promedio de calificaciones 0-5
  total_vendidos?: number   // Total de unidades vendidas
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