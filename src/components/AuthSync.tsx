import React, { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { supabase as globalSupabase } from "@/lib/supabaseClient";

const AuthSync: React.FC = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
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
        // Evitar sincronización duplicada para el mismo usuario
        if (syncedRef.current === user.id) {
          return;
        }

        console.log("AuthSync: Usuario autenticado en Clerk. Intentando obtener JWT para Supabase.");
        try {
          let clerkToken = await getToken({ template: "supabase" });
          
          if (!clerkToken) {
            console.log("AuthSync: No se encontró template 'supabase', usando token por defecto.");
            clerkToken = await getToken();
          }

          if (clerkToken) {
            console.log(`AuthSync: Token de Clerk obtenido. Longitud: ${clerkToken.length}`);
            
            // USAR EL JWT PARA AUTENTICAR EN SUPABASE
            console.log("AuthSync: Estableciendo sesión JWT en Supabase.");
            
            const { error: authError } = await globalSupabase.auth.setSession({
              access_token: clerkToken,
              refresh_token: clerkToken // Clerk maneja el refresh
            });

            if (authError) {
              console.error("AuthSync: Error al establecer sesión JWT:", authError.message);
              return;
            }

            console.log("AuthSync: Sesión JWT establecida exitosamente en Supabase.");
            
            // Ahora crear/actualizar usuario con el contexto autenticado
            try {
              const { error: upsertError } = await globalSupabase
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
              } else {
                console.log("AuthSync: Usuario creado/actualizado exitosamente en Supabase.");
                syncedRef.current = user.id; // Marcar como sincronizado
              }
            } catch (manualError) {
              console.error("AuthSync: Error inesperado al crear usuario:", manualError);
            }
          } else {
            console.warn("AuthSync: Clerk no devolvió token. Cerrando sesion de Supabase.");
            await globalSupabase.auth.signOut();
          }
        } catch (err) {
          console.error("AuthSync: Error inesperado al obtener o establecer la sesion de Supabase:", err);
          await globalSupabase.auth.signOut();
        }
      } else {
        console.log("AuthSync: Usuario no autenticado en Clerk. Cerrando sesion de Supabase.");
        syncedRef.current = null; // Reset sincronización
        try {
          const { error: signOutError } = await globalSupabase.auth.signOut();
          if (signOutError) {
            console.error("AuthSync: Error al cerrar la sesion de Supabase:", signOutError);
          } else {
            console.log("AuthSync: Sesion de Supabase cerrada.");
          }
        } catch (err) {
          console.error("AuthSync: Error inesperado al cerrar la sesion de Supabase:", err);
        }
      }
    };

    syncClerkWithSupabase();
  }, [isLoaded, isSignedIn, user?.id]); // Solo sincronizar cuando cambie el ID del usuario

  return null;
};

export default AuthSync;
