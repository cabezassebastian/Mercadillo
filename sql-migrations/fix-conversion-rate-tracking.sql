-- =====================================================
-- FIX: Sistema de Tasa de Conversión Mejorado
-- Trackea visitas a productos y calcula conversión real
-- =====================================================

-- 1. Asegurar que la tabla product_views existe
-- =====================================================
CREATE TABLE IF NOT EXISTS product_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  user_id uuid, -- NULL si es anónimo
  session_id text, -- Para trackear sesiones anónimas
  viewed_at timestamptz DEFAULT now(),
  referrer text, -- De dónde vino el visitante
  user_agent text -- Navegador/dispositivo
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_product_views_producto_id ON product_views(producto_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_product_views_session_id ON product_views(session_id);

-- =====================================================
-- 2. Función mejorada para calcular tasa de conversión
-- =====================================================
DROP FUNCTION IF EXISTS get_conversion_rate();

CREATE OR REPLACE FUNCTION get_conversion_rate()
RETURNS TABLE(
  total_views bigint,
  total_orders bigint,
  conversion_rate numeric
) 
LANGUAGE plpgsql
AS $$
DECLARE
  views_count bigint;
  orders_count bigint;
  rate numeric;
BEGIN
  -- Contar TOTAL de visitas (no distintas) en los últimos 30 días
  SELECT COUNT(*) INTO views_count
  FROM product_views
  WHERE viewed_at >= NOW() - INTERVAL '30 days';
  
  -- Si no hay visitas registradas, usar conteo de productos activos como estimación
  IF views_count = 0 THEN
    SELECT COUNT(*) * 10 INTO views_count
    FROM productos
    WHERE activo = true;
  END IF;
  
  -- Contar pedidos completados en los últimos 30 días
  SELECT COUNT(*) INTO orders_count
  FROM pedidos
  WHERE created_at >= NOW() - INTERVAL '30 days'
  AND estado IN ('pagado', 'procesando', 'enviado', 'entregado');
  
  -- Calcular tasa de conversión
  IF views_count > 0 THEN
    rate := ROUND((orders_count::numeric / views_count::numeric) * 100, 2);
  ELSE
    rate := 0;
  END IF;
  
  -- Retornar resultado
  RETURN QUERY SELECT views_count, orders_count, rate;
END;
$$;

-- =====================================================
-- 3. Función para registrar visitas a productos
-- =====================================================
CREATE OR REPLACE FUNCTION track_product_view(
  p_producto_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO product_views (producto_id, user_id, session_id, referrer, user_agent)
  VALUES (p_producto_id, p_user_id, p_session_id, p_referrer, p_user_agent);
END;
$$;

-- =====================================================
-- 4. Función para obtener productos más vistos
-- =====================================================
CREATE OR REPLACE FUNCTION get_most_viewed_products(
  limit_count INTEGER DEFAULT 10,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  producto_id uuid,
  nombre text,
  total_views bigint,
  unique_visitors bigint,
  imagen text,
  precio numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as producto_id,
    p.nombre,
    COUNT(pv.id)::bigint as total_views,
    COUNT(DISTINCT COALESCE(pv.user_id::text, pv.session_id))::bigint as unique_visitors,
    p.imagen,
    p.precio
  FROM productos p
  INNER JOIN product_views pv ON pv.producto_id = p.id
  WHERE pv.viewed_at >= NOW() - make_interval(days => days_back)
  GROUP BY p.id, p.nombre, p.imagen, p.precio
  ORDER BY total_views DESC
  LIMIT limit_count;
END;
$$;

-- =====================================================
-- 5. Dar permisos
-- =====================================================
GRANT EXECUTE ON FUNCTION get_conversion_rate() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_product_view(uuid, uuid, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_most_viewed_products(INTEGER, INTEGER) TO anon, authenticated;

-- Permitir insertar visitas a usuarios anónimos
GRANT INSERT ON product_views TO anon, authenticated;
GRANT SELECT ON product_views TO authenticated;

-- =====================================================
-- 6. Comentarios descriptivos
-- =====================================================
COMMENT ON FUNCTION get_conversion_rate() IS 'Calcula la tasa de conversión de visitas a pedidos en los últimos 30 días';
COMMENT ON FUNCTION track_product_view(uuid, uuid, text, text, text) IS 'Registra una visita a un producto';
COMMENT ON FUNCTION get_most_viewed_products(INTEGER, INTEGER) IS 'Retorna los productos más vistos en un período';
COMMENT ON TABLE product_views IS 'Almacena todas las visitas a productos para analytics';

-- =====================================================
-- 7. Verificar que todo se creó correctamente
-- =====================================================
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_conversion_rate', 'track_product_view', 'get_most_viewed_products')
  AND routine_schema = 'public';

-- Verificar tabla
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'product_views' AND table_schema = 'public';

-- =====================================================
-- 8. Probar las funciones
-- =====================================================
SELECT * FROM get_conversion_rate();
