-- =====================================================
-- SCRIPT PARA ARREGLAR POLÍTICAS RLS DE ADMIN
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =====================================================

-- Primero, eliminar las políticas existentes de productos si existen
DROP POLICY IF EXISTS "Todos pueden ver productos activos" ON productos;
DROP POLICY IF EXISTS "Admins pueden gestionar productos" ON productos;

-- Crear políticas nuevas y correctas para productos
-- 1. Permitir a todos ver productos activos (SIN AUTENTICACIÓN)
CREATE POLICY "Productos activos públicos" ON productos
  FOR SELECT 
  USING (activo = true);

-- 2. Permitir a admins ver TODOS los productos (activos e inactivos)
CREATE POLICY "Admins ven todos los productos" ON productos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text 
      AND usuarios.rol = 'admin'
    )
  );

-- 3. Permitir a admins INSERTAR productos
CREATE POLICY "Admins pueden insertar productos" ON productos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text 
      AND usuarios.rol = 'admin'
    )
  );

-- 4. Permitir a admins ACTUALIZAR productos
CREATE POLICY "Admins pueden actualizar productos" ON productos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text 
      AND usuarios.rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text 
      AND usuarios.rol = 'admin'
    )
  );

-- 5. Permitir a admins ELIMINAR productos
CREATE POLICY "Admins pueden eliminar productos" ON productos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text 
      AND usuarios.rol = 'admin'
    )
  );

-- =====================================================
-- POLÍTICAS PARA USUARIOS (si no existen)
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON usuarios;

-- Permitir a usuarios ver su propio perfil
CREATE POLICY "Ver propio perfil" ON usuarios
  FOR SELECT
  USING (id = auth.uid()::text);

-- Permitir a usuarios actualizar su propio perfil
CREATE POLICY "Actualizar propio perfil" ON usuarios
  FOR UPDATE
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Permitir a admins ver TODOS los usuarios
CREATE POLICY "Admins ven todos" ON usuarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u2
      WHERE u2.id = auth.uid()::text 
      AND u2.rol = 'admin'
    )
  );

-- Permitir a admins actualizar roles de otros usuarios
CREATE POLICY "Admins pueden actualizar usuarios" ON usuarios
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u2
      WHERE u2.id = auth.uid()::text 
      AND u2.rol = 'admin'
    )
  );

-- =====================================================
-- POLÍTICAS PARA PEDIDOS (si no existen)
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON pedidos;
DROP POLICY IF EXISTS "Sistema puede actualizar pedidos via webhook" ON pedidos;
DROP POLICY IF EXISTS "Admins pueden ver todos los pedidos" ON pedidos;

-- Usuarios ven sus propios pedidos
CREATE POLICY "Ver propios pedidos" ON pedidos
  FOR SELECT
  USING (usuario_id = auth.uid()::text);

-- Usuarios pueden crear sus propios pedidos
CREATE POLICY "Crear propios pedidos" ON pedidos
  FOR INSERT
  WITH CHECK (usuario_id = auth.uid()::text);

-- Sistema puede actualizar pedidos (para webhooks de MercadoPago)
-- Esta política permite actualizaciones incluso sin autenticación (para webhooks)
CREATE POLICY "Sistema actualiza pedidos" ON pedidos
  FOR UPDATE
  USING (true);

-- Admins ven todos los pedidos
CREATE POLICY "Admins ven todos pedidos" ON pedidos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text 
      AND usuarios.rol = 'admin'
    )
  );

-- Admins pueden actualizar cualquier pedido
CREATE POLICY "Admins actualizan pedidos" ON pedidos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text 
      AND usuarios.rol = 'admin'
    )
  );

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver todas las políticas de productos
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'productos';

-- Ver todas las políticas de usuarios
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- Ver todas las políticas de pedidos
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'pedidos';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Después de ejecutar este script, recarga tu aplicación web (F5)
-- 2. Verifica que tu usuario tenga rol='admin' en la tabla usuarios
-- 3. Si sigue sin funcionar, revisa la consola del navegador
-- 4. Las políticas RLS verifican que auth.uid() coincida con usuarios.id
-- =====================================================
