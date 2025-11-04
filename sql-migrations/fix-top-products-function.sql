-- =====================================================
-- FIX: Función get_top_selling_products para Admin Dashboard
-- Esta función muestra los productos más vendidos
-- Compatible con Edge Function que usa parámetro 'limit_count'
-- =====================================================

-- Eliminar versiones anteriores de la función
DROP FUNCTION IF EXISTS get_top_selling_products(INTEGER);
DROP FUNCTION IF EXISTS get_top_selling_products(text, int);

-- Crear la función compatible con la Edge Function actual
CREATE OR REPLACE FUNCTION get_top_selling_products(
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  sold bigint,
  revenue numeric,
  slug text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nombre as name,
    COALESCE(
      (
        SELECT COUNT(*)
        FROM pedidos ped,
        jsonb_array_elements(ped.items) AS item
        WHERE 
          -- Verificar que el ID es un UUID válido antes de convertir
          item->>'id' ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
          AND (item->>'id')::uuid = p.id
          AND ped.created_at >= NOW() - INTERVAL '30 days'
          AND ped.estado IN ('pagado', 'procesando', 'enviado', 'entregado')
      ), 0
    )::bigint as sold,
    COALESCE(
      (
        SELECT SUM((item->>'cantidad')::numeric * (item->>'precio')::numeric)
        FROM pedidos ped,
        jsonb_array_elements(ped.items) AS item
        WHERE 
          -- Verificar que el ID es un UUID válido antes de convertir
          item->>'id' ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
          AND (item->>'id')::uuid = p.id
          AND ped.created_at >= NOW() - INTERVAL '30 days'
          AND ped.estado IN ('pagado', 'procesando', 'enviado', 'entregado')
      ), 0
    )::numeric as revenue,
    COALESCE(p.slug, p.id::text) as slug
  FROM productos p
  WHERE p.activo = true
  ORDER BY sold DESC, revenue DESC
  LIMIT limit_count;
END;
$$;

-- Dar permisos a usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION get_top_selling_products(INTEGER) TO anon, authenticated;

-- Comentario descriptivo
COMMENT ON FUNCTION get_top_selling_products(INTEGER) IS 'Retorna los productos más vendidos en los últimos 30 días';

-- Verificar que la función se creó correctamente
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'get_top_selling_products'
  AND routine_schema = 'public';

-- Probar la función
SELECT * FROM get_top_selling_products(5);
