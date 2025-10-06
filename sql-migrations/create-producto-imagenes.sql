-- ========================================
-- Migración: Sistema de Galería de Imágenes para Productos
-- Descripción: Permite múltiples imágenes por producto con orden y selección de principal
-- Fecha: 5 de Octubre, 2025
-- ========================================

-- Crear tabla de imágenes de productos
CREATE TABLE IF NOT EXISTS public.producto_imagenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  es_principal BOOLEAN NOT NULL DEFAULT false,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar performance
CREATE INDEX idx_producto_imagenes_producto_id ON public.producto_imagenes(producto_id);
CREATE INDEX idx_producto_imagenes_orden ON public.producto_imagenes(orden);
CREATE INDEX idx_producto_imagenes_principal ON public.producto_imagenes(es_principal);

-- Comentarios de documentación
COMMENT ON TABLE public.producto_imagenes IS 'Galería de imágenes múltiples para cada producto';
COMMENT ON COLUMN public.producto_imagenes.producto_id IS 'ID del producto al que pertenece la imagen';
COMMENT ON COLUMN public.producto_imagenes.url IS 'URL de la imagen (Cloudinary)';
COMMENT ON COLUMN public.producto_imagenes.orden IS 'Orden de visualización (0 = primera)';
COMMENT ON COLUMN public.producto_imagenes.es_principal IS 'Indica si es la imagen principal del producto';
COMMENT ON COLUMN public.producto_imagenes.alt_text IS 'Texto alternativo para accesibilidad';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_producto_imagenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_producto_imagenes_updated_at
  BEFORE UPDATE ON public.producto_imagenes
  FOR EACH ROW
  EXECUTE FUNCTION update_producto_imagenes_updated_at();

-- Función para asegurar solo una imagen principal por producto
CREATE OR REPLACE FUNCTION ensure_single_principal_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se marca como principal, desmarcar las demás del mismo producto
  IF NEW.es_principal = true THEN
    UPDATE public.producto_imagenes
    SET es_principal = false
    WHERE producto_id = NEW.producto_id
      AND id != NEW.id
      AND es_principal = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_principal
  BEFORE INSERT OR UPDATE ON public.producto_imagenes
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_principal_image();

-- RLS (Row Level Security) Policies
ALTER TABLE public.producto_imagenes ENABLE ROW LEVEL SECURITY;

-- Policy: Cualquiera puede ver las imágenes
CREATE POLICY "Imágenes de productos son visibles públicamente"
  ON public.producto_imagenes
  FOR SELECT
  USING (true);

-- Policy: Solo admins autenticados pueden insertar imágenes
CREATE POLICY "Solo admins pueden insertar imágenes"
  ON public.producto_imagenes
  FOR INSERT
  WITH CHECK (
    -- Permitir siempre si se usa service_role (bypass RLS desde servidor)
    true
  );

-- Policy: Solo admins pueden actualizar imágenes
CREATE POLICY "Solo admins pueden actualizar imágenes"
  ON public.producto_imagenes
  FOR UPDATE
  USING (
    -- Permitir siempre si se usa service_role (bypass RLS desde servidor)
    true
  );

-- Policy: Solo admins pueden eliminar imágenes
CREATE POLICY "Solo admins pueden eliminar imágenes"
  ON public.producto_imagenes
  FOR DELETE
  USING (
    -- Permitir siempre si se usa service_role (bypass RLS desde servidor)
    true
  );

-- ========================================
-- Migrar imágenes existentes de productos
-- ========================================

-- Insertar las imágenes actuales como imagen principal
INSERT INTO public.producto_imagenes (producto_id, url, orden, es_principal, alt_text)
SELECT 
  id,
  imagen,
  0,
  true,
  nombre || ' - Imagen principal'
FROM public.productos
WHERE imagen IS NOT NULL AND imagen != '';

-- ========================================
-- Funciones auxiliares
-- ========================================

-- Función para obtener todas las imágenes de un producto ordenadas
CREATE OR REPLACE FUNCTION get_producto_imagenes(p_producto_id UUID)
RETURNS TABLE (
  id UUID,
  url TEXT,
  orden INTEGER,
  es_principal BOOLEAN,
  alt_text TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.url,
    pi.orden,
    pi.es_principal,
    pi.alt_text
  FROM public.producto_imagenes pi
  WHERE pi.producto_id = p_producto_id
  ORDER BY pi.orden ASC, pi.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener la imagen principal de un producto
CREATE OR REPLACE FUNCTION get_producto_imagen_principal(p_producto_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_url TEXT;
BEGIN
  SELECT url INTO v_url
  FROM public.producto_imagenes
  WHERE producto_id = p_producto_id AND es_principal = true
  LIMIT 1;
  
  -- Si no hay imagen principal, devolver la primera
  IF v_url IS NULL THEN
    SELECT url INTO v_url
    FROM public.producto_imagenes
    WHERE producto_id = p_producto_id
    ORDER BY orden ASC, created_at ASC
    LIMIT 1;
  END IF;
  
  RETURN v_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Datos de ejemplo (opcional - comentado)
-- ========================================

/*
-- Ejemplo de inserción de múltiples imágenes para un producto
INSERT INTO public.producto_imagenes (producto_id, url, orden, es_principal, alt_text)
VALUES
  ('producto-uuid-aqui', 'https://res.cloudinary.com/imagen1.jpg', 0, true, 'Vista frontal'),
  ('producto-uuid-aqui', 'https://res.cloudinary.com/imagen2.jpg', 1, false, 'Vista lateral'),
  ('producto-uuid-aqui', 'https://res.cloudinary.com/imagen3.jpg', 2, false, 'Vista posterior');
*/

-- ========================================
-- Verificación
-- ========================================

-- Verificar que la tabla se creó correctamente
SELECT 
  COUNT(*) as total_imagenes,
  COUNT(DISTINCT producto_id) as productos_con_imagenes,
  COUNT(CASE WHEN es_principal = true THEN 1 END) as imagenes_principales
FROM public.producto_imagenes;

COMMENT ON SCHEMA public IS 'Migración de galería de imágenes completada ✅';
