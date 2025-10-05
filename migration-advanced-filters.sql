-- Migration: Advanced Filters Support
-- Adds rating_promedio and total_vendidos to productos table
-- Created: October 5, 2025

-- Add new columns to productos table
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS rating_promedio DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_promedio >= 0 AND rating_promedio <= 5),
ADD COLUMN IF NOT EXISTS total_vendidos INTEGER DEFAULT 0 CHECK (total_vendidos >= 0);

-- Add comments for documentation
COMMENT ON COLUMN productos.rating_promedio IS 'Promedio de calificaciones de usuarios (0-5 estrellas)';
COMMENT ON COLUMN productos.total_vendidos IS 'Total de unidades vendidas del producto';

-- Create indexes for better performance on sorting/filtering
CREATE INDEX IF NOT EXISTS idx_productos_rating_promedio ON productos(rating_promedio DESC);
CREATE INDEX IF NOT EXISTS idx_productos_total_vendidos ON productos(total_vendidos DESC);
CREATE INDEX IF NOT EXISTS idx_productos_stock_disponible ON productos(stock) WHERE stock > 0;

-- Optional: Update existing products with sample data (remove if not needed)
-- This is just for testing, remove in production
UPDATE productos 
SET 
  rating_promedio = ROUND((RANDOM() * 2 + 3)::numeric, 2), -- Random ratings between 3.00 and 5.00
  total_vendidos = FLOOR(RANDOM() * 100)::integer -- Random sales between 0 and 100
WHERE rating_promedio IS NULL OR total_vendidos IS NULL;

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos' 
  AND column_name IN ('rating_promedio', 'total_vendidos')
ORDER BY ordinal_position;
