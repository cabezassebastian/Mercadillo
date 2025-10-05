-- ============================================
-- PASO 1: Crear las columnas
-- ============================================
-- Ejecuta esto PRIMERO

ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS rating_promedio DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_promedio >= 0 AND rating_promedio <= 5);

ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS total_vendidos INTEGER DEFAULT 0 CHECK (total_vendidos >= 0);

-- Verifica que las columnas se crearon
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
  AND column_name IN ('rating_promedio', 'total_vendidos');

-- ============================================
-- PASO 2: Llenar con datos de prueba
-- ============================================
-- Ejecuta esto DESPUÉS de verificar que las columnas existen

UPDATE productos 
SET 
  rating_promedio = ROUND((RANDOM() * 2 + 3)::numeric, 2), -- Random 3.00 - 5.00
  total_vendidos = FLOOR(RANDOM() * 100)::integer -- Random 0 - 100
WHERE rating_promedio = 0.00 OR total_vendidos = 0;

-- Verifica los datos actualizados
SELECT 
  id,
  nombre,
  rating_promedio,
  total_vendidos
FROM productos
LIMIT 10;

-- ============================================
-- PASO 3: Crear índices para performance
-- ============================================
-- Ejecuta esto ÚLTIMO

CREATE INDEX IF NOT EXISTS idx_productos_rating_promedio 
ON productos(rating_promedio DESC);

CREATE INDEX IF NOT EXISTS idx_productos_total_vendidos 
ON productos(total_vendidos DESC);

CREATE INDEX IF NOT EXISTS idx_productos_stock_disponible 
ON productos(stock) WHERE stock > 0;

-- Verifica los índices creados
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'productos' 
  AND indexname LIKE 'idx_productos_%';
