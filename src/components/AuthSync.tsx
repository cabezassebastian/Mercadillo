import React, { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

// Cliente simple para crear usuarios
const supabaseForUsers = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false, // No persistir sesión para evitar conflictos
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

const AuthSync: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const syncedRef = useRef<string | null>(null); // Para evitar sincronización duplicada

  useEffect(() => {
    const syncClerkWithSupabase = async () => {
      console.log("AuthSync: Iniciando sincronizacion.");
      console.log(`AuthSync: Clerk isLoaded: ${isLoaded}, isSignedIn: ${isSignedIn}`);

      if (!isLoaded) {
        console.log("AuthSync: Clerk aún no está listo. Sincronizacion pospuesta.");
        return;
      }

      if (isSignedIn && user) {
        // Evitar sincronización duplicada
        if (syncedRef.current === user.id) {
          console.log("AuthSync: Usuario ya sincronizado. Saltando.");
          return;
        }

        console.log("AuthSync: Usuario autenticado en Clerk. Creando/actualizando usuario en Supabase.");

        try {
          // Solo crear/actualizar usuario en Supabase (sin intentar autenticar)
          const { error: upsertError } = await supabaseForUsers
            .from('usuarios')
            .upsert({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              nombre: user.firstName || '',
              apellido: user.lastName || '',
              telefono: user.primaryPhoneNumber?.phoneNumber || null,
              direccion: null,
              rol: 'cliente'
            }, {
              onConflict: 'id'
            });

          if (upsertError) {
            console.error("AuthSync: Error al crear usuario:", upsertError.message);
            return;
          }

          console.log("AuthSync: Usuario creado/actualizado exitosamente en Supabase.");
          syncedRef.current = user.id; // Marcar como sincronizado
          
        } catch (error) {
          console.error("AuthSync: Error inesperado al crear usuario:", error);
        }
      } else {
        console.log("AuthSync: Usuario no autenticado. Limpiando sincronización.");
        syncedRef.current = null;
      }
    };

    syncClerkWithSupabase();
  }, [isLoaded, isSignedIn, user]);

  return null; // Este componente no renderiza nada
};

export default AuthSync;
