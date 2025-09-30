-- Verificar y crear tabla historial_navegacion si es necesario
-- Ejecutar en Supabase SQL Editor

-- Verificar si la tabla existe
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_navegacion'
ORDER BY ordinal_position;

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS historial_navegacion (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id text NOT NULL,
  producto_id text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_navegacion_usuario 
ON historial_navegacion(usuario_id);

CREATE INDEX IF NOT EXISTS idx_historial_navegacion_updated 
ON historial_navegacion(updated_at DESC);

-- Verificar que la tabla se creó correctamente
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_navegacion'
ORDER BY ordinal_position;