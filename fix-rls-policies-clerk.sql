-- 🔧 FIX: Cambiar políticas RLS para usar Clerk JWT en lugar de auth.uid()

-- El problema: auth.uid() retorna NULL con Clerk JWT
-- La solución: usar el claim 'sub' del JWT directamente

-- PASO 1: Eliminar políticas antiguas
DROP POLICY IF EXISTS "Usuarios pueden ver su propia lista de deseos" ON lista_deseos;
DROP POLICY IF EXISTS "Usuarios pueden gestionar su lista de deseos" ON lista_deseos;

-- PASO 2: Crear nuevas políticas usando el JWT de Clerk
-- El JWT de Clerk tiene el user_id en el claim 'sub'
CREATE POLICY "Usuarios pueden ver su propia lista de deseos" ON lista_deseos
    FOR SELECT 
    USING (
        usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );

CREATE POLICY "Usuarios pueden gestionar su lista de deseos" ON lista_deseos
    FOR ALL 
    USING (
        usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );

-- PASO 3: Verificar las nuevas políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'lista_deseos'
ORDER BY policyname;

-- PASO 4: Probar que el JWT funciona (esto debería retornar tu user_id)
SELECT current_setting('request.jwt.claims', true)::json->>'sub' as clerk_user_id;

-- 🎯 NOTA: Si no ves tu user_id en el paso 4, significa que el JWT no se está
-- pasando correctamente desde el frontend. Pero las políticas ya estarán listas.
