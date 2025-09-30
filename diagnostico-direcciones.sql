-- Script completo de diagnóstico y corrección para direcciones_usuario
-- Ejecutar paso a paso en Supabase SQL Editor

-- 1. Verificar que la tabla existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'direcciones_usuario'
) as tabla_existe;

-- 2. Verificar estructura de la tabla
\d direcciones_usuario;

-- 3. Verificar políticas actuales
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'direcciones_usuario';

-- 4. Verificar si RLS está habilitado
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'direcciones_usuario';

-- 5. Eliminar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Usuarios pueden ver sus direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "usuarios_pueden_insertar_sus_direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "admins_pueden_gestionar_todas_direcciones" ON direcciones_usuario;

-- 6. Habilitar RLS
ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas específicas y detalladas
CREATE POLICY "direcciones_select" ON direcciones_usuario
    FOR SELECT 
    TO authenticated
    USING (auth.uid()::text = usuario_id);

CREATE POLICY "direcciones_insert" ON direcciones_usuario
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "direcciones_update" ON direcciones_usuario
    FOR UPDATE 
    TO authenticated
    USING (auth.uid()::text = usuario_id)
    WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "direcciones_delete" ON direcciones_usuario
    FOR DELETE 
    TO authenticated
    USING (auth.uid()::text = usuario_id);

-- 8. Política adicional para admins
CREATE POLICY "direcciones_admin_all" ON direcciones_usuario
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text AND rol = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text AND rol = 'admin'
        )
    );

-- 9. Verificar que las políticas se crearon correctamente
SELECT 
    policyname, 
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'direcciones_usuario'
ORDER BY policyname;

-- 10. Test de inserción (reemplazar 'TEST_USER_ID' con un ID real de Clerk)
-- SET session.auth_uid = 'TEST_USER_ID';
-- INSERT INTO direcciones_usuario (usuario_id, nombre, direccion_completa, distrito) 
-- VALUES ('TEST_USER_ID', 'Test', 'Dirección de prueba', 'Lima');

-- 11. Verificar función de dirección predeterminada
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'asegurar_direccion_predeterminada';

-- 12. Verificar trigger
SELECT tgname, tgrelid::regclass, tgtype
FROM pg_trigger 
WHERE tgname = 'trigger_direccion_predeterminada';