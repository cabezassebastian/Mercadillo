-- =====================================================
-- MIGRACIONES NECESARIAS PARA MERCADILLO
-- Ejecuta este archivo completo en Supabase SQL Editor
-- =====================================================

-- 1. AGREGAR COLUMNA GOOGLE MAPS URL
-- =====================================================
ALTER TABLE direcciones_usuario 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

COMMENT ON COLUMN direcciones_usuario.google_maps_url IS 'URL de Google Maps para la ubicación exacta de la dirección';

ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

COMMENT ON COLUMN pedidos.google_maps_url IS 'URL de Google Maps de la dirección de entrega del pedido';


-- 2. AGREGAR COLUMNAS FALTANTES EN PRODUCTOS
-- =====================================================
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagenes TEXT[];

ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS rating_promedio NUMERIC(3,2) DEFAULT 0;

COMMENT ON COLUMN productos.imagenes IS 'Array de URLs de imágenes del producto';
COMMENT ON COLUMN productos.rating_promedio IS 'Rating promedio del producto (0-5)';


-- 3. FUNCIÓN: get_top_selling_products
-- =====================================================
DROP FUNCTION IF EXISTS get_top_selling_products(INTEGER);
DROP FUNCTION IF EXISTS get_top_selling_products(text, int);

CREATE OR REPLACE FUNCTION get_top_selling_products(
  p_period text DEFAULT '7d',
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  producto_id uuid,
  nombre text,
  precio numeric,
  imagen text,
  slug text,
  total_vendido bigint,
  rating_promedio numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
  fecha_inicio timestamp;
BEGIN
  -- Calcular fecha de inicio según período
  CASE p_period
    WHEN '7d' THEN fecha_inicio := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN fecha_inicio := NOW() - INTERVAL '30 days';
    WHEN '90d' THEN fecha_inicio := NOW() - INTERVAL '90 days';
    ELSE fecha_inicio := NOW() - INTERVAL '7 days';
  END CASE;

  RETURN QUERY
  SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio,
    p.imagen,
    COALESCE(p.slug, p.id::text) as slug,
    COALESCE(
      (
        SELECT COUNT(*)
        FROM pedidos ped,
        jsonb_array_elements(ped.items) AS item
        WHERE (item->>'id')::uuid = p.id
        AND ped.created_at >= fecha_inicio
        AND ped.estado IN ('pagado', 'procesando', 'enviado', 'entregado')
      ), 0
    )::bigint as total_vendido,
    COALESCE(p.rating_promedio, 0) as rating_promedio
  FROM productos p
  WHERE p.activo = true
  ORDER BY total_vendido DESC, p.rating_promedio DESC
  LIMIT p_limit;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION get_top_selling_products(text, int) TO anon, authenticated;


-- 5. VERIFICACIÓN DE CONFIGURACIÓN
-- =====================================================
-- Verifica que las columnas existan
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('productos', 'pedidos', 'direcciones_usuario')
  AND column_name IN ('imagenes', 'rating_promedio', 'google_maps_url')
ORDER BY table_name, column_name;

-- Verifica que la función exista
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'get_top_selling_products';

-- FIN DE MIGRACIONES
