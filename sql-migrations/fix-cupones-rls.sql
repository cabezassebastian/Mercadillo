-- Fix: Políticas RLS para tabla cupones
-- Run this SQL in Supabase SQL Editor

-- PRIMERO: Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Cupones activos son visibles para todos" ON cupones;
DROP POLICY IF EXISTS "Solo admins pueden crear cupones" ON cupones;
DROP POLICY IF EXISTS "Solo admins pueden actualizar cupones" ON cupones;
DROP POLICY IF EXISTS "Solo admins pueden eliminar cupones" ON cupones;
DROP POLICY IF EXISTS "Admins pueden ver todos los cupones" ON cupones;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios cupones usados" ON cupones_usados;
DROP POLICY IF EXISTS "Admins pueden ver todos los cupones usados" ON cupones_usados;
DROP POLICY IF EXISTS "Sistema puede registrar uso de cupones" ON cupones_usados;
DROP POLICY IF EXISTS "Admins pueden eliminar cupones usados" ON cupones_usados;

-- Habilitar RLS en tablas de cupones
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones_usados ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA TABLA CUPONES

-- 1. Todos pueden VER cupones activos (para validar en frontend)
CREATE POLICY "Cupones activos son visibles para todos"
  ON cupones FOR SELECT
  TO authenticated
  USING (activo = true);

-- 2. Solo admins pueden INSERTAR cupones
CREATE POLICY "Solo admins pueden crear cupones"
  ON cupones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()::text
      AND rol = 'admin'
    )
  );

-- 3. Solo admins pueden ACTUALIZAR cupones
CREATE POLICY "Solo admins pueden actualizar cupones"
  ON cupones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()::text
      AND rol = 'admin'
    )
  );

-- 4. Solo admins pueden ELIMINAR cupones
CREATE POLICY "Solo admins pueden eliminar cupones"
  ON cupones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()::text
      AND rol = 'admin'
    )
  );

-- 5. Admins pueden ver TODOS los cupones (activos e inactivos)
CREATE POLICY "Admins pueden ver todos los cupones"
  ON cupones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()::text
      AND rol = 'admin'
    )
  );

-- POLÍTICAS PARA TABLA CUPONES_USADOS

-- 1. Usuarios pueden ver sus propios usos de cupones
CREATE POLICY "Usuarios pueden ver sus propios cupones usados"
  ON cupones_usados FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid()::text);

-- 2. Admins pueden ver todos los cupones usados
CREATE POLICY "Admins pueden ver todos los cupones usados"
  ON cupones_usados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()::text
      AND rol = 'admin'
    )
  );

-- 3. Sistema puede insertar registros de uso (a través de función RPC)
CREATE POLICY "Sistema puede registrar uso de cupones"
  ON cupones_usados FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid()::text);

-- 4. Admins pueden eliminar registros de uso
CREATE POLICY "Admins pueden eliminar cupones usados"
  ON cupones_usados FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()::text
      AND rol = 'admin'
    )
  );

-- Verificar políticas creadas
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('cupones', 'cupones_usados')
ORDER BY tablename, policyname;

