-- =====================================================
-- MIGRACIÓN: Arreglar políticas RLS de tabla resenas
-- Descripción: Permitir a admins y usuarios autenticados
--              crear y gestionar reseñas correctamente
-- Fecha: 2025-10-06
-- =====================================================

-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "resenas_select_policy" ON resenas;
DROP POLICY IF EXISTS "resenas_insert_policy" ON resenas;
DROP POLICY IF EXISTS "resenas_update_policy" ON resenas;
DROP POLICY IF EXISTS "resenas_delete_policy" ON resenas;

-- 2. Habilitar RLS
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICA: Lectura (SELECT) - Todos pueden leer reseñas
CREATE POLICY "resenas_select_policy"
ON resenas
FOR SELECT
TO authenticated, anon
USING (true);

-- 4. POLÍTICA: Inserción (INSERT) - Solo usuarios autenticados
--    pueden crear reseñas (validación de compra se hace en código)
CREATE POLICY "resenas_insert_policy"
ON resenas
FOR INSERT
TO authenticated
WITH CHECK (
  -- El usuario debe estar autenticado y el usuario_id debe coincidir
  auth.uid()::text = usuario_id
);

-- 5. POLÍTICA: Actualización (UPDATE) - Solo el dueño puede actualizar su reseña
CREATE POLICY "resenas_update_policy"
ON resenas
FOR UPDATE
TO authenticated
USING (auth.uid()::text = usuario_id)
WITH CHECK (auth.uid()::text = usuario_id);

-- 6. POLÍTICA: Eliminación (DELETE) - El dueño O admin pueden eliminar
CREATE POLICY "resenas_delete_policy"
ON resenas
FOR DELETE
TO authenticated
USING (
  -- El usuario es el dueño de la reseña
  auth.uid()::text = usuario_id
  OR
  -- O el usuario es admin
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver todas las políticas de la tabla resenas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'resenas'
ORDER BY policyname;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON POLICY "resenas_select_policy" ON resenas IS 
'Todos pueden leer reseñas (autenticados y anónimos)';

COMMENT ON POLICY "resenas_insert_policy" ON resenas IS 
'Solo usuarios autenticados pueden crear reseñas. La validación de compra se hace en el código de la aplicación.';

COMMENT ON POLICY "resenas_update_policy" ON resenas IS 
'Solo el dueño de la reseña puede actualizarla';

COMMENT ON POLICY "resenas_delete_policy" ON resenas IS 
'El dueño de la reseña o un administrador pueden eliminarla';
