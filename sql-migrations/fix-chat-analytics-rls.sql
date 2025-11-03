-- Fix RLS para ChatAnalytics
-- Este script crea una función RPC que permite a los admins acceder a las analíticas del chat
-- Compatible con Clerk (requiere pasar el user_id desde el frontend)

-- Primero, eliminar la función si existe
DROP FUNCTION IF EXISTS get_chat_analytics(TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS get_chat_analytics(TEXT, TIMESTAMP WITH TIME ZONE);

-- Crear función para obtener analíticas del chat (solo admins)
-- Ahora acepta el user_id como parámetro para Clerk
CREATE OR REPLACE FUNCTION get_chat_analytics(
  clerk_user_id TEXT,
  start_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  usuario_id TEXT,
  mensaje TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_rol TEXT;
BEGIN
  -- Obtener el rol del usuario desde la tabla usuarios
  SELECT rol INTO user_rol
  FROM usuarios 
  WHERE id = clerk_user_id;

  -- Verificar que el usuario exista
  IF user_rol IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado en la tabla usuarios. User ID: %', clerk_user_id;
  END IF;

  -- Verificar que el usuario sea admin
  IF user_rol != 'admin' THEN
    RAISE EXCEPTION 'Acceso denegado. Se requiere rol admin. Tu rol actual: %', user_rol;
  END IF;

  -- Retornar datos de conversaciones
  RETURN QUERY
  SELECT 
    c.usuario_id,
    c.mensaje,
    c.metadata,
    c.created_at
  FROM chat_conversations c
  WHERE c.created_at >= start_date
  ORDER BY c.created_at DESC;
END;
$$;

-- Dar permisos a usuarios autenticados para ejecutar la función
GRANT EXECUTE ON FUNCTION get_chat_analytics(TEXT, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_analytics(TEXT, TIMESTAMP WITH TIME ZONE) TO anon;

-- Comentario
COMMENT ON FUNCTION get_chat_analytics IS 'Permite a los administradores obtener analíticas del chatbot. Requiere rol admin en tabla usuarios. Compatible con Clerk.';
