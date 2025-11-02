-- ============================================
-- MIGRACIÓN COMPLETA PARA PANEL ADMIN
-- Ejecutar TODO este archivo en Supabase SQL Editor
-- ============================================

-- ============================================
-- PARTE 1: Funciones de Analytics
-- ============================================

-- 1. Top selling products function
CREATE OR REPLACE FUNCTION get_top_selling_products(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  id uuid, 
  name text, 
  sold integer, 
  revenue numeric
) AS $$
SELECT 
  p.id, 
  p.nombre AS name, 
  COALESCE(SUM(pp.cantidad)::integer, 0) AS sold, 
  COALESCE(SUM(pp.cantidad * pp.precio_unitario), 0) AS revenue
FROM productos p
LEFT JOIN pedidos_productos pp ON p.id = pp.producto_id::uuid
LEFT JOIN pedidos ped ON pp.pedido_id = ped.id
WHERE ped.estado IS NULL OR ped.estado != 'cancelado'
GROUP BY p.id, p.nombre
HAVING SUM(pp.cantidad) > 0
ORDER BY sold DESC
LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- 2. Product views tracking table
CREATE TABLE IF NOT EXISTS product_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  user_id text REFERENCES usuarios(id) ON DELETE SET NULL,
  viewed_at timestamp DEFAULT now(),
  session_id text
);

CREATE INDEX IF NOT EXISTS idx_product_views_producto_id ON product_views(producto_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);

-- 3. Daily sales function (últimos 7 días)
CREATE OR REPLACE FUNCTION get_daily_sales(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  date text, 
  total numeric,
  orders_count bigint
) AS $$
SELECT 
  TO_CHAR(created_at, 'DD/MM') AS date,
  COALESCE(SUM(total), 0) AS total,
  COUNT(*) AS orders_count
FROM pedidos
WHERE 
  created_at >= CURRENT_DATE - (days_back || ' days')::interval
  AND (estado IS NULL OR estado != 'cancelado')
GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE(created_at)
ORDER BY DATE(created_at) ASC;
$$ LANGUAGE sql STABLE;

-- 4. Weekly sales function (últimas 4 semanas)
CREATE OR REPLACE FUNCTION get_weekly_sales(weeks_back INTEGER DEFAULT 4)
RETURNS TABLE(
  week_label text,
  total numeric,
  orders_count bigint
) AS $$
SELECT 
  'Sem ' || TO_CHAR(created_at, 'WW') AS week_label,
  COALESCE(SUM(total), 0) AS total,
  COUNT(*) AS orders_count
FROM pedidos
WHERE 
  created_at >= CURRENT_DATE - (weeks_back || ' weeks')::interval
  AND (estado IS NULL OR estado != 'cancelado')
GROUP BY TO_CHAR(created_at, 'WW'), DATE_TRUNC('week', created_at)
ORDER BY DATE_TRUNC('week', created_at) ASC;
$$ LANGUAGE sql STABLE;

-- 5. Monthly sales function (últimos 12 meses)
CREATE OR REPLACE FUNCTION get_monthly_sales(months_back INTEGER DEFAULT 12)
RETURNS TABLE(
  month text, 
  total numeric,
  orders_count bigint
) AS $$
SELECT 
  TO_CHAR(created_at, 'Mon YYYY') AS month,
  COALESCE(SUM(total), 0) AS total,
  COUNT(*) AS orders_count
FROM pedidos
WHERE 
  created_at >= CURRENT_DATE - (months_back || ' months')::interval
  AND (estado IS NULL OR estado != 'cancelado')
GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
ORDER BY DATE_TRUNC('month', created_at) ASC;
$$ LANGUAGE sql STABLE;

-- 6. Conversion rate calculation
CREATE OR REPLACE FUNCTION get_conversion_rate()
RETURNS TABLE(
  total_views bigint,
  total_orders bigint,
  conversion_rate numeric
) AS $$
SELECT 
  COALESCE((SELECT COUNT(DISTINCT producto_id) FROM product_views), 0) AS total_views,
  COALESCE((SELECT COUNT(*) FROM pedidos WHERE estado IS NULL OR estado != 'cancelado'), 0) AS total_orders,
  CASE 
    WHEN (SELECT COUNT(DISTINCT producto_id) FROM product_views) > 0 
    THEN ROUND(
      ((SELECT COUNT(*) FROM pedidos WHERE estado IS NULL OR estado != 'cancelado')::numeric / 
       (SELECT COUNT(DISTINCT producto_id) FROM product_views)::numeric) * 100, 
      2
    )
    ELSE 0
  END AS conversion_rate;
$$ LANGUAGE sql STABLE;

-- 7. Low stock products (stock <= threshold)
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 5)
RETURNS TABLE(
  id uuid,
  nombre text,
  stock integer,
  precio numeric,
  categoria text
) AS $$
SELECT 
  id,
  nombre,
  stock,
  precio,
  categoria
FROM productos
WHERE stock <= threshold AND stock >= 0
ORDER BY stock ASC, nombre ASC;
$$ LANGUAGE sql STABLE;

-- ============================================
-- PARTE 2: Vista pedidos_productos
-- ============================================

-- Eliminar vista existente si tiene estructura diferente
DROP VIEW IF EXISTS pedidos_productos CASCADE;

-- Vista para items de pedidos (compatibilidad con funciones analytics)
CREATE OR REPLACE VIEW pedidos_productos AS
SELECT 
  p.id AS pedido_id,
  (item->>'id')::text AS producto_id,
  (item->>'cantidad')::integer AS cantidad,
  (item->>'precio_unitario')::numeric AS precio_unitario,
  (item->>'nombre')::text AS producto_nombre
FROM pedidos p,
LATERAL jsonb_array_elements(p.items) AS item;

-- ============================================
-- PARTE 3: Ajustes en tabla usuarios (si es necesario)
-- ============================================

-- Agregar campos nombre y apellido si no existen
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'nombre'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN nombre text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'apellido'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN apellido text;
  END IF;
END $$;

-- ============================================
-- PARTE 4: Permisos para funciones RPC
-- ============================================

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_top_selling_products(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_daily_sales(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_sales(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_sales(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversion_rate() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_low_stock_products(INTEGER) TO anon, authenticated;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Listar todas las funciones creadas
SELECT 
  routine_name as "Función Creada",
  'OK' as "Estado"
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'get_%'
ORDER BY routine_name;

-- Mostrar mensaje de éxito
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migraciones completadas exitosamente!';
  RAISE NOTICE '✅ Funciones SQL creadas para panel admin';
  RAISE NOTICE '✅ Vista pedidos_productos creada';
  RAISE NOTICE '✅ Campos nombre/apellido en usuarios actualizados';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Ahora puedes usar el panel admin sin errores';
END $$;
