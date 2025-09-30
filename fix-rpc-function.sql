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

-- 5. Crear función RPC que maneje correctamente los tipos de datos
CREATE OR REPLACE FUNCTION actualizar_historial_navegacion(
  p_usuario_id text,
  p_producto_id text
) RETURNS void AS $$
BEGIN
  -- Validar que el producto_id sea un UUID válido
  IF p_producto_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'Invalid UUID format for producto_id: %', p_producto_id;
  END IF;
  
  -- Insertar o actualizar el registro de historial
  -- Convertir producto_id de text a uuid usando cast
  INSERT INTO historial_navegacion (usuario_id, producto_id, created_at, updated_at)
  VALUES (p_usuario_id, p_producto_id::uuid, NOW(), NOW())
  ON CONFLICT (usuario_id, producto_id) 
  DO UPDATE SET 
    updated_at = NOW();
    
  -- Log para debugging (opcional)
  RAISE NOTICE 'Historial actualizado para usuario: %, producto: %', p_usuario_id, p_producto_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Dar permisos públicos a la función
GRANT EXECUTE ON FUNCTION actualizar_historial_navegacion(text, text) TO anon;
GRANT EXECUTE ON FUNCTION actualizar_historial_navegacion(text, text) TO authenticated;

-- 7. Verificar que solo existe una versión de la función
SELECT routine_name, routine_type, specific_name
FROM information_schema.routines 
WHERE routine_name = 'actualizar_historial_navegacion';

-- 8. Crear usuario temporal para el test
INSERT INTO usuarios (id, email, nombre, apellido, rol)
VALUES ('test_user', 'test@ejemplo.com', 'Usuario', 'Prueba', 'cliente')
ON CONFLICT (id) DO NOTHING;

-- 9. Probar la función manualmente con un UUID válido
-- NOTA: Si obtienes error de clave foránea para producto_id, 
-- usa un UUID de un producto real de tu tabla productos
SELECT actualizar_historial_navegacion('test_user', 'c1a7962d-4ffe-49f2-aef1-2ed8a16d70ed');

-- 10. Verificar que se insertó
SELECT * FROM historial_navegacion WHERE usuario_id = 'test_user';

-- 11. Limpiar test (historial y usuario temporal)
DELETE FROM historial_navegacion WHERE usuario_id = 'test_user';
DELETE FROM usuarios WHERE id = 'test_user';

-- 12. Mensaje de confirmación
SELECT 'Función RPC recreada exitosamente con conversión UUID. Test completado. Cachés limpiados.' as resultado;