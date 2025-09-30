import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Cliente base de Supabase
const baseSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Cliente personalizado que puede inyectar contexto de usuario
class SupabaseWithAuth {
  private client: SupabaseClient;
  private currentUserId: string | null = null;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // Establecer el ID del usuario actual para contexto RLS
  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    console.log("SupabaseWithAuth: Usuario establecido:", userId);
  }

  // Obtener el ID del usuario actual
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Wrapper para from() que inyecta el contexto del usuario solo para direcciones
  from(table: string) {
    const query = this.client.from(table);
    
    // Para tabla direcciones_usuario, modificar las consultas con contexto
    if (table === 'direcciones_usuario' && this.currentUserId) {
      const originalInsert = query.insert.bind(query);
      const originalSelect = query.select.bind(query);
      const originalUpdate = query.update.bind(query);
      const originalDelete = query.delete.bind(query);
      
      return {
        ...query,
        select: (columns = '*') => {
          return originalSelect(columns).eq('usuario_id', this.currentUserId);
        },
        insert: (values: any) => {
          // Inyectar usuario_id automáticamente
          const valuesWithUser = Array.isArray(values) 
            ? values.map(v => ({ ...v, usuario_id: this.currentUserId }))
            : { ...values, usuario_id: this.currentUserId };
          return originalInsert(valuesWithUser);
        },
        update: (values: any) => {
          return originalUpdate(values).eq('usuario_id', this.currentUserId);
        },
        delete: () => {
          return originalDelete().eq('usuario_id', this.currentUserId);
        }
      };
    }
    
    // Para todas las demás tablas, retornar query normal
    return query;
  }

  // Proxy para otras propiedades del cliente original
  get auth() {
    return this.client.auth;
  }

  get rpc() {
    return this.client.rpc.bind(this.client);
  }

  get storage() {
    return this.client.storage;
  }

  get realtime() {
    return this.client.realtime;
  }
}

// Instancia singleton del cliente personalizado
export const supabaseWithAuth = new SupabaseWithAuth(baseSupabase);

// Re-exportar para compatibilidad
export const supabase = supabaseWithAuth;
export default supabaseWithAuth;