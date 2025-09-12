import React, { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase as globalSupabase } from "@/lib/supabaseClient";

const AuthSync: React.FC = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    const syncClerkWithSupabase = async () => {
      if (!isLoaded) return; // Esperar a que Clerk cargue

      if (isSignedIn) {
        // Usuario autenticado en Clerk, obtener JWT para Supabase
        try {
          const clerkToken = await getToken({ template: "supabase" });

          if (clerkToken) {
            // Si hay token, establecer la sesion en Supabase
            const { error: setSessionError } = await globalSupabase.auth.setSession({
              access_token: clerkToken,
              refresh_token: clerkToken, // Se usa el mismo token para refresh, Clerk lo maneja
            });

            if (setSessionError) {
              console.error("AuthSync: Error al establecer la sesion de Supabase con el token de Clerk:", setSessionError);
            } else {
              console.log("AuthSync: Sesion de Supabase establecida exitosamente con token de Clerk.");
            }
          } else {
            console.warn("AuthSync: No se pudo obtener el token de Clerk para Supabase.");
            await globalSupabase.auth.signOut(); // Asegurarse de cerrar sesion si no hay token
          }
        } catch (err) {
          console.error("AuthSync: Error inesperado al obtener o establecer la sesion de Supabase:", err);
          await globalSupabase.auth.signOut(); // En caso de error, cerrar sesion
        }
      } else {
        // Usuario no autenticado en Clerk, cerrar sesion en Supabase
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
  }, [isLoaded, isSignedIn, getToken]);

  return null; // Este componente no renderiza nada visible
};

export default AuthSync;
