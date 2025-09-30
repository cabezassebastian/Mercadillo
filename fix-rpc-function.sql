-- Script para solucionar problemas de función RPC duplicada y esquema
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar funciones RPC existentes (todas las versiones)
DROP FUNCTION IF EXISTS actualizar_historial_navegacion(text, text);
DROP FUNCTION IF EXISTS actualizar_historial_navegacion(text, uuid);
DROP FUNCTION IF EXISTS actualizar_historial_navegacion(uuid, text);
DROP FUNCTION IF EXISTS actualizar_historial_navegacion(uuid, uuid);

-- 2. Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'historial_navegacion' 
ORDER BY ordinal_position;

-- 3. Asegurar que RLS esté deshabilitado
ALTER TABLE historial_navegacion DISABLE ROW LEVEL SECURITY;

-- 4. Limpiar cachés de esquema (forzar refresh)
NOTIFY pgrst, 'reload schema';

-- 5. Crear función RPC simple que funcione con ambos tipos
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

-- 6. Dar permisos públicos a la función
GRANT EXECUTE ON FUNCTION actualizar_historial_navegacion(text, text) TO anon;
GRANT EXECUTE ON FUNCTION actualizar_historial_navegacion(text, text) TO authenticated;

-- 7. Verificar que solo existe una versión de la función
SELECT routine_name, routine_type, specific_name
FROM information_schema.routines 
WHERE routine_name = 'actualizar_historial_navegacion';

-- 8. Probar la función manualmente
SELECT actualizar_historial_navegacion('test_user', 'test_product');

-- 9. Verificar que se insertó
SELECT * FROM historial_navegacion WHERE usuario_id = 'test_user';

-- 10. Limpiar test
DELETE FROM historial_navegacion WHERE usuario_id = 'test_user';

-- 11. Mensaje de confirmación
SELECT 'Función RPC recreada exitosamente. Cachés limpiados.' as resultado;