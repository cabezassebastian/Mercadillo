-- 🔒 HABILITAR RLS CORRECTAMENTE
-- Ejecutar DESPUÉS de confirmar que todo funciona sin RLS

-- ==========================================
-- PARTE 1: HABILITAR RLS EN HISTORIAL_NAVEGACION
-- ==========================================

ALTER TABLE historial_navegacion ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios vean solo su historial
CREATE POLICY "usuarios_ver_su_historial" ON historial_navegacion
    FOR SELECT
    USING (usuario_id = auth.uid()::text);

-- Política para que usuarios gestionen solo su historial
CREATE POLICY "usuarios_gestionar_su_historial" ON historial_navegacion
    FOR ALL
    USING (usuario_id = auth.uid()::text)
    WITH CHECK (usuario_id = auth.uid()::text);

-- Política para admins (ver todo)
CREATE POLICY "admins_ver_todo_historial" ON historial_navegacion
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid()::text 
            AND usuarios.rol = 'admin'
        )
    );

SELECT '✅ RLS habilitado en historial_navegacion' as resultado;

-- ==========================================
-- PARTE 2: HABILITAR RLS EN DIRECCIONES_USUARIO
-- ==========================================

ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios vean solo sus direcciones
CREATE POLICY "usuarios_ver_sus_direcciones" ON direcciones_usuario
    FOR SELECT
    USING (usuario_id = auth.uid()::text);

-- Política para que usuarios gestionen solo sus direcciones
CREATE POLICY "usuarios_gestionar_sus_direcciones" ON direcciones_usuario
    FOR ALL
    USING (usuario_id = auth.uid()::text)
    WITH CHECK (usuario_id = auth.uid()::text);

SELECT '✅ RLS habilitado en direcciones_usuario' as resultado;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operacion
FROM pg_policies
WHERE tablename IN ('historial_navegacion', 'direcciones_usuario')
ORDER BY tablename, policyname;

SELECT '🔒 RLS habilitado correctamente en todas las tablas' as resumen;
