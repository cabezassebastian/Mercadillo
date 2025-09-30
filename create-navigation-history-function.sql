-- Función RPC para actualizar historial de navegación
-- Ejecutar en Supabase SQL Editor

-- Verificar si la función ya existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'actualizar_historial_navegacion' 
AND routine_type = 'FUNCTION';

-- Crear la función si no existe
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

-- Verificar que la función se creó correctamente
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'actualizar_historial_navegacion';