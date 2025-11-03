-- Agregar columna slug a la tabla productos
-- Esta columna almacenará URLs amigables únicas para cada producto

-- 1. Agregar la columna slug
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Generar slugs para productos existentes
-- Usamos una función PostgreSQL para generar slugs automáticamente
UPDATE productos
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRANSLATE(
        nombre,
        'áéíóúàèìòùäëïöüâêîôûñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑ',
        'aeiouaeiouaeiouaeiounAEIOUAEIOUAEIOUAEIOUN'
      ),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

-- 3. Hacer el slug único y no nulo
ALTER TABLE productos
ALTER COLUMN slug SET NOT NULL;

-- 4. Crear índice único en slug para búsquedas rápidas
CREATE UNIQUE INDEX IF NOT EXISTS idx_productos_slug ON productos(slug);

-- 5. Crear función para generar slug automáticamente en nuevos productos
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Si no se proporciona un slug, generarlo automáticamente
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRANSLATE(
            NEW.nombre,
            'áéíóúàèìòùäëïöüâêîôûñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑ',
            'aeiouaeiouaeiouaeiounAEIOUAEIOUAEIOUAEIOUN'
          ),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    );
    
    -- Si el slug ya existe, agregar un sufijo numérico
    IF EXISTS (SELECT 1 FROM productos WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::text, 1, 8);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para ejecutar la función antes de insertar o actualizar
DROP TRIGGER IF EXISTS set_product_slug ON productos;
CREATE TRIGGER set_product_slug
  BEFORE INSERT OR UPDATE OF nombre ON productos
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_slug();

-- 7. Comentarios
COMMENT ON COLUMN productos.slug IS 'URL-friendly unique identifier for SEO (e.g., "smartphone-a20-128gb")';
COMMENT ON FUNCTION generate_product_slug IS 'Automatically generates a unique slug from product name';

-- 8. Verificar resultados
SELECT id, nombre, slug FROM productos LIMIT 10;
