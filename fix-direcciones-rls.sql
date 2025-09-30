-- Corrección de políticas RLS para direcciones_usuario
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas existentes para direcciones_usuario
DROP POLICY IF EXISTS "Usuarios pueden ver sus direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus direcciones" ON direcciones_usuario;

-- Crear políticas específicas y corregidas
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

-- Política para admins (opcional)
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

-- Verificar que RLS esté habilitado
ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'direcciones_usuario';