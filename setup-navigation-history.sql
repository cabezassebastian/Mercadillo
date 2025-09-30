-- Script simplificado para crear tabla de historial y función RPC
-- Ejecutar TODO este script en Supabase SQL Editor

-- 1. Crear tabla historial_navegacion si no existe
CREATE TABLE IF NOT EXISTS historial_navegacion (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id text NOT NULL,
  producto_id text NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

-- 2. Crear índice único para evitar duplicados
DROP INDEX IF EXISTS idx_historial_unique;
CREATE UNIQUE INDEX idx_historial_unique 
ON historial_navegacion(usuario_id, producto_id);

-- 3. Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_usuario 
ON historial_navegacion(usuario_id);

CREATE INDEX IF NOT EXISTS idx_historial_updated 
ON historial_navegacion(updated_at DESC);

-- 4. Crear o reemplazar la función RPC
CREATE OR REPLACE FUNCTION actualizar_historial_navegacion(
  p_usuario_id text,
  p_producto_id text
) RETURNS void AS $$
BEGIN
  -- Insertar o actualizar el registro de historial
  INSERT INTO historial_navegacion (usuario_id, producto_id, created_at, updated_at)
  VALUES (p_usuario_id, p_producto_id, NOW(), NOW())
  ON CONFLICT (usuario_id, producto_id) 
  DO UPDATE SET 
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Dar permisos públicos a la función (necesario para que funcione desde la app)
GRANT EXECUTE ON FUNCTION actualizar_historial_navegacion(text, text) TO anon;
GRANT EXECUTE ON FUNCTION actualizar_historial_navegacion(text, text) TO authenticated;

-- 6. Verificaciones finales
SELECT 'Tabla creada exitosamente' as resultado;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'actualizar_historial_navegacion';

-- 7. Mostrar estructura de la tabla
\d historial_navegacion;