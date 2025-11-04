import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';

/**
 * Hook para trackear visitas a productos
 * Registra automáticamente cuando un usuario ve un producto
 */
export function useProductView(productoId: string | undefined) {
  const { user } = useUser();

  useEffect(() => {
    if (!productoId) return;

    const trackView = async () => {
      try {
        // Obtener o crear session ID para usuarios anónimos
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('analytics_session_id', sessionId);
        }

        // Obtener información del navegador
        const referrer = document.referrer || 'direct';
        const userAgent = navigator.userAgent;

        // Clerk user IDs son strings, NO uuids, así que pasamos NULL
        // para evitar errores de tipo
        const userId = null; // Clerk IDs no son UUID compatibles

        console.log('Tracking view for product:', productoId);
        console.log('Session ID:', sessionId);

        // Registrar la visita
        const { error } = await supabase.rpc('track_product_view', {
          p_producto_id: productoId,
          p_user_id: userId,
          p_session_id: sessionId,
          p_referrer: referrer,
          p_user_agent: userAgent
        });

        if (error) {
          console.error('Error tracking product view:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
        } else {
          console.log('✅ Product view tracked successfully:', productoId);
        }
      } catch (err) {
        console.error('Exception tracking product view:', err);
      }
    };

    // Trackear después de 2 segundos para contar solo vistas reales
    const timeout = setTimeout(trackView, 2000);

    return () => clearTimeout(timeout);
  }, [productoId, user?.id]);
}
