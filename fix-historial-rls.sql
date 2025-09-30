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
INSERT INTO historial_navegacion (usuario_id, producto_id, created_at, updated_at)
VALUES ('test_user', 'test_product', NOW(), NOW())
ON CONFLICT (usuario_id, producto_id) 
DO UPDATE SET updated_at = NOW();

-- 7. Verificar que se insertó
SELECT * FROM historial_navegacion WHERE usuario_id = 'test_user';

-- 8. Limpiar registro de prueba
DELETE FROM historial_navegacion WHERE usuario_id = 'test_user';