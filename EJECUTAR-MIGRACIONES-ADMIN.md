# 🔧 Solución: Funciones SQL Faltantes para Panel Admin

## ❌ Problema Detectado

El panel admin muestra errores porque **faltan funciones SQL** en Supabase:

```
Error al cargar ventas
Verifica que las funciones SQL estén creadas en Supabase

Error al cargar productos más vendidos
Verifica que la función SQL esté creada en Supabase
```

## ✅ Solución

Necesitas ejecutar las **migraciones SQL** en tu base de datos de Supabase.

---

## 📋 Paso 1: Abrir SQL Editor en Supabase

1. Ve a: https://supabase.com/dashboard/project/xwubnuokmfghtyyfpgtl
2. Click en **SQL Editor** (panel izquierdo)
3. Click en **New Query**

---

## 📋 Paso 2: Ejecutar Funciones de Analytics

Copia y pega **TODO** este SQL y ejecuta (botón "Run" o F5):

```sql
-- ============================================
-- SQL migration for analytics functions
-- Dashboard con Analytics - Mercadillo
-- ============================================

-- ============================================
-- 1. Top selling products function
-- ============================================
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
LEFT JOIN pedidos_productos pp ON p.id = pp.producto_id
LEFT JOIN pedidos ped ON pp.pedido_id = ped.id
WHERE ped.estado IS NULL OR ped.estado != 'cancelado'
GROUP BY p.id, p.nombre
HAVING SUM(pp.cantidad) > 0
ORDER BY sold DESC
LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- ============================================
-- 2. Product views tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS product_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  user_id text REFERENCES usuarios(id) ON DELETE SET NULL,
  viewed_at timestamp DEFAULT now(),
  session_id text
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_product_views_producto_id ON product_views(producto_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);

-- ============================================
-- 3. Daily sales function (últimos 7 días)
-- ============================================
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

-- ============================================
-- 4. Weekly sales function (últimas 4 semanas)
-- ============================================
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

-- ============================================
-- 5. Monthly sales function (últimos 12 meses)
-- ============================================
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

-- ============================================
-- 6. Conversion rate calculation
-- ============================================
CREATE OR REPLACE FUNCTION get_conversion_rate()
RETURNS TABLE(
  total_views bigint,
  total_orders bigint,
  conversion_rate numeric
) AS $$
SELECT 
  (SELECT COUNT(DISTINCT producto_id) FROM product_views) AS total_views,
  (SELECT COUNT(*) FROM pedidos WHERE estado IS NULL OR estado != 'cancelado') AS total_orders,
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

-- ============================================
-- 7. Low stock products (stock <= 5)
-- ============================================
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
```

---

## 📋 Paso 3: Verificar que se crearon las funciones

En el SQL Editor, ejecuta esta query para verificar:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'get_%'
ORDER BY routine_name;
```

**Deberías ver estas 5 funciones:**
- ✅ `get_conversion_rate`
- ✅ `get_daily_sales`
- ✅ `get_low_stock_products`
- ✅ `get_monthly_sales`
- ✅ `get_top_selling_products`
- ✅ `get_weekly_sales`

---

## 📋 Paso 4: Verificar Tabla pedidos_productos

El error de "productos más vendidos" también requiere que exista la tabla `pedidos_productos`.

Ejecuta esto para crearla:

```sql
-- Vista para items de pedidos (compatibilidad)
CREATE OR REPLACE VIEW pedidos_productos AS
SELECT 
  p.id AS pedido_id,
  item->>'id' AS producto_id,
  (item->>'cantidad')::integer AS cantidad,
  (item->>'precio_unitario')::numeric AS precio_unitario,
  item->>'nombre' AS producto_nombre
FROM pedidos p,
LATERAL jsonb_array_elements(p.items) AS item;
```

---

## 🎯 Resultado Esperado

Después de ejecutar estas migraciones, el panel admin debería mostrar:

✅ **Ventas por Mes (Últimos 12 meses)** - Gráfico funcionando  
✅ **Top 5 Productos Más Vendidos** - Lista funcionando  
✅ **Alertas de Stock Bajo** - Productos con stock ≤ 5  
✅ **Tasa de Conversión** - 0.00% (hasta que tengas visitas)  
✅ **Gestión de Pedidos** - Lista completa de pedidos  

---

## 🐛 Si sigue sin funcionar

### Problema: "No aparecen pedidos en /admin/pedidos"

**Causa posible 1:** La tabla `usuarios` no tiene los campos `nombre` y `apellido`.

**Solución:** Ejecuta esto para verificar:

```sql
-- Ver estructura de tabla usuarios
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;
```

Si la tabla `usuarios` tiene `nombre_completo` en lugar de `nombre` y `apellido`, ejecuta:

```sql
-- Agregar campos nombre y apellido si no existen
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS nombre text,
ADD COLUMN IF NOT EXISTS apellido text;

-- Dividir nombre_completo en nombre y apellido (si existe)
UPDATE usuarios 
SET 
  nombre = SPLIT_PART(nombre_completo, ' ', 1),
  apellido = SUBSTRING(nombre_completo FROM POSITION(' ' IN nombre_completo) + 1)
WHERE nombre IS NULL AND nombre_completo IS NOT NULL;
```

**Causa posible 2:** El campo en `pedidos` se llama diferente.

```sql
-- Verificar nombre del campo de usuario en pedidos
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
  AND column_name LIKE '%usuario%';
```

Si se llama `user_id` en lugar de `usuario_id`, ejecuta:

```sql
-- Renombrar columna si es necesario
ALTER TABLE pedidos 
RENAME COLUMN user_id TO usuario_id;
```

**Verificar pedidos:**

```sql
-- Ver pedidos con usuarios
SELECT 
  p.id,
  p.usuario_id,
  p.total,
  p.estado,
  u.email,
  u.nombre,
  u.apellido
FROM pedidos p
LEFT JOIN usuarios u ON p.usuario_id = u.id
ORDER BY p.created_at DESC
LIMIT 5;
```

---

## 📞 Siguiente Paso

1. **Ejecuta las migraciones SQL** en Supabase SQL Editor
2. **Refresca tu panel admin** (F5)
3. **Verifica que los errores desaparecieron**
4. **Avísame si sigue habiendo algún problema**

---

**Después de ejecutar las migraciones, todo debería funcionar correctamente!** ✅
