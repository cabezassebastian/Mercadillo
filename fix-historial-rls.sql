-- Solucionar problemas de RLS en historial_navegacion
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estado actual de RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'historial_navegacion';

-- 2. Ver políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'historial_navegacion';

-- 3. Deshabilitar RLS temporalmente para que funcione con nuestro sistema actual
ALTER TABLE historial_navegacion DISABLE ROW LEVEL SECURITY;

-- 4. Alternativamente, si prefieres mantener RLS, crear políticas permisivas
-- ALTER TABLE historial_navegacion ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "permitir_operaciones_historial" ON historial_navegacion;
-- CREATE POLICY "permitir_operaciones_historial" ON historial_navegacion
--     FOR ALL 
--     USING (true)
--     WITH CHECK (true);

-- 5. Verificar que RLS está deshabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'historial_navegacion';

-- 6. Probar inserción manual para verificar que funciona
-- Asegurar que existe un usuario de prueba compatible con la FK
INSERT INTO usuarios (id, email, nombre, apellido, rol, created_at, updated_at)
VALUES ('test_user', 'test_user@example.com', 'Test', 'User', 'cliente', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar un producto de prueba con UUID fijo para satisfacer la FK
INSERT INTO productos (id, nombre, descripcion, precio, imagen, stock, categoria, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'TEST_TMP_PRODUCT', 'Producto temporal para pruebas RLS', 0, '', 0, 'Otros', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO historial_navegacion (usuario_id, producto_id, created_at, updated_at)
VALUES ('test_user', '11111111-1111-1111-1111-111111111111', NOW(), NOW());

-- 7. Verificar que se insertó
SELECT * FROM historial_navegacion WHERE usuario_id = 'test_user';

-- 8. Limpiar registro de prueba
DELETE FROM historial_navegacion WHERE usuario_id = 'test_user';
-- Eliminar usuario de prueba
DELETE FROM usuarios WHERE id = 'test_user';
-- Eliminar producto de prueba
DELETE FROM productos WHERE id = '11111111-1111-1111-1111-111111111111';