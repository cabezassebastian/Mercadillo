-- =====================================================
-- Verificar que las visitas se están registrando
-- =====================================================

-- 1. Ver las últimas 20 visitas registradas
SELECT 
  id,
  producto_id,
  user_id,
  session_id,
  viewed_at,
  referrer,
  SUBSTRING(user_agent, 1, 50) as user_agent_preview
FROM product_views
ORDER BY viewed_at DESC
LIMIT 20;

-- 2. Contar visitas por minuto (últimos 60 minutos)
SELECT 
  DATE_TRUNC('minute', viewed_at) as minuto,
  COUNT(*) as visitas
FROM product_views
WHERE viewed_at >= NOW() - INTERVAL '60 minutes'
GROUP BY DATE_TRUNC('minute', viewed_at)
ORDER BY minuto DESC;

-- 3. Contar visitas totales
SELECT 
  COUNT(*) as total_visitas,
  COUNT(DISTINCT producto_id) as productos_unicos_vistos,
  COUNT(DISTINCT COALESCE(user_id::text, session_id)) as visitantes_unicos
FROM product_views;

-- 4. Visitas en últimos 30 días
SELECT 
  COUNT(*) as visitas_ultimos_30_dias
FROM product_views
WHERE viewed_at >= NOW() - INTERVAL '30 days';

-- 5. Ver productos más vistos hoy
SELECT 
  p.nombre,
  COUNT(pv.id) as visitas_hoy
FROM productos p
INNER JOIN product_views pv ON pv.producto_id = p.id
WHERE pv.viewed_at >= CURRENT_DATE
GROUP BY p.id, p.nombre
ORDER BY visitas_hoy DESC
LIMIT 10;

-- 6. Visitas por hora del día (hoy)
SELECT 
  EXTRACT(HOUR FROM viewed_at) as hora,
  COUNT(*) as visitas
FROM product_views
WHERE viewed_at >= CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM viewed_at)
ORDER BY hora;
