import React, { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { supabaseWithAuth as globalSupabase } from "@/lib/supabaseWithAuth";
import { createClient } from "@supabase/supabase-js";

// Cliente base para operaciones que no requieren el wrapper
const baseSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

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
            
            // En lugar de usar el JWT de Clerk directamente, establecer contexto de usuario
            console.log("AuthSync: Estableciendo contexto de usuario para Supabase.");
            
            // Establecer el usuario actual en el cliente personalizado
            globalSupabase.setCurrentUser(user.id);
            
            // Crear/actualizar usuario en la tabla usuarios (usando cliente base)
            try {
              const { error: upsertError } = await baseSupabase
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
              console.log("AuthSync: Contexto de usuario establecido con ID:", user.id);
              
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
