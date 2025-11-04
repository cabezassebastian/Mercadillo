-- =====================================================
-- DIAGNÓSTICO: Verificar sistema de tracking
-- =====================================================

-- 1. Verificar que la tabla existe con todas las columnas
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'product_views'
ORDER BY ordinal_position;

-- 2. Verificar que las funciones existen
-- =====================================================
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_conversion_rate', 'track_product_view', 'get_most_viewed_products')
  AND routine_schema = 'public';

-- 3. Verificar permisos en la tabla
-- =====================================================
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'product_views';

-- 4. Verificar si hay datos en product_views
-- =====================================================
SELECT COUNT(*) as total_views FROM product_views;

-- 5. Ver últimas 10 visitas registradas (si existen)
-- =====================================================
SELECT 
  id,
  producto_id,
  user_id,
  session_id,
  viewed_at,
  referrer
FROM product_views
ORDER BY viewed_at DESC
LIMIT 10;

-- 6. Verificar políticas RLS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'product_views';

-- 7. Verificar si RLS está habilitado
-- =====================================================
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'product_views';

-- 8. Probar insertar una visita manualmente
-- =====================================================
-- Primero obtener un producto_id real
DO $$
DECLARE
  test_producto_id uuid;
BEGIN
  -- Obtener el ID de un producto activo
  SELECT id INTO test_producto_id 
  FROM productos 
  WHERE activo = true 
  LIMIT 1;
  
  IF test_producto_id IS NOT NULL THEN
    -- Intentar insertar una visita de prueba
    INSERT INTO product_views (producto_id, session_id, referrer)
    VALUES (test_producto_id, 'test_session_' || NOW()::text, 'manual_test');
    
    RAISE NOTICE 'Visita de prueba insertada exitosamente para producto: %', test_producto_id;
  ELSE
    RAISE NOTICE 'No se encontraron productos activos para probar';
  END IF;
END $$;

-- 9. Verificar la inserción
-- =====================================================
SELECT 
  COUNT(*) as visitas_de_prueba
FROM product_views
WHERE referrer = 'manual_test';

-- 10. Probar la función de tracking
-- =====================================================
DO $$
DECLARE
  test_producto_id uuid;
BEGIN
  -- Obtener el ID de un producto activo
  SELECT id INTO test_producto_id 
  FROM productos 
  WHERE activo = true 
  LIMIT 1;
  
  IF test_producto_id IS NOT NULL THEN
    -- Llamar la función de tracking
    PERFORM track_product_view(
      test_producto_id,
      NULL,
      'function_test_session',
      'function_test',
      'Mozilla/5.0 Test'
    );
    
    RAISE NOTICE 'Función track_product_view ejecutada para producto: %', test_producto_id;
  END IF;
END $$;

-- 11. Verificar que la función funcionó
-- =====================================================
SELECT 
  COUNT(*) as visitas_por_funcion
FROM product_views
WHERE referrer = 'function_test';

-- 12. Probar get_conversion_rate
-- =====================================================
SELECT * FROM get_conversion_rate();

-- =====================================================
-- RESUMEN DE DIAGNÓSTICO
-- =====================================================
SELECT 
  'Total de visitas en product_views' as metrica,
  COUNT(*)::text as valor
FROM product_views

UNION ALL

SELECT 
  'Visitas en últimos 30 días' as metrica,
  COUNT(*)::text as valor
FROM product_views
WHERE viewed_at >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
  'Productos activos' as metrica,
  COUNT(*)::text as valor
FROM productos
WHERE activo = true

UNION ALL

SELECT 
  'Pedidos en últimos 30 días' as metrica,
  COUNT(*)::text as valor
FROM pedidos
WHERE created_at >= NOW() - INTERVAL '30 days'
AND estado IN ('pagado', 'procesando', 'enviado', 'entregado');
