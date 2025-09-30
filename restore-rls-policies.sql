-- Restaurar políticas RLS correctas después de la corrección de autenticación
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar RLS si estaba deshabilitado
ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar cualquier política temporal
DROP POLICY IF EXISTS "direcciones_temp_allow_all" ON direcciones_usuario;

-- 3. Eliminar políticas existentes para direcciones_usuario
DROP POLICY IF EXISTS "Usuarios pueden ver sus direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "usuarios_pueden_insertar_sus_direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "admins_pueden_gestionar_todas_direcciones" ON direcciones_usuario;

-- 4. Crear políticas específicas y corregidas
CREATE POLICY "usuarios_pueden_ver_sus_direcciones" ON direcciones_usuario
    FOR SELECT 
    USING (auth.uid()::text = usuario_id);

CREATE POLICY "usuarios_pueden_insertar_sus_direcciones" ON direcciones_usuario
    FOR INSERT 
    WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "usuarios_pueden_actualizar_sus_direcciones" ON direcciones_usuario
    FOR UPDATE 
    USING (auth.uid()::text = usuario_id)
    WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "usuarios_pueden_eliminar_sus_direcciones" ON direcciones_usuario
    FOR DELETE 
    USING (auth.uid()::text = usuario_id);

-- 5. Política para admins
CREATE POLICY "admins_pueden_gestionar_todas_direcciones" ON direcciones_usuario
    FOR ALL 
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

-- 6. Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'direcciones_usuario';