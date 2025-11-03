-- Fix RLS para ChatAnalytics
-- Este script crea una función RPC que permite a los admins acceder a las analíticas del chat

-- Crear función para obtener analíticas del chat (solo admins)
CREATE OR REPLACE FUNCTION get_chat_analytics(
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
AS $$
BEGIN
  -- Verificar que el usuario sea admin
  IF NOT EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid()::text 
    AND rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
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
GRANT EXECUTE ON FUNCTION get_chat_analytics(TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_analytics(TIMESTAMP WITH TIME ZONE) TO anon;

-- Comentario
COMMENT ON FUNCTION get_chat_analytics IS 'Permite a los administradores obtener analíticas del chatbot. Requiere rol admin.';
