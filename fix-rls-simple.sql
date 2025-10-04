-- =====================================================
-- SCRIPT SIMPLIFICADO PARA ARREGLAR POLÍTICAS RLS
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =====================================================

-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- =====================================================

-- Productos
DROP POLICY IF EXISTS "Todos pueden ver productos activos" ON productos;
DROP POLICY IF EXISTS "Admins pueden gestionar productos" ON productos;
DROP POLICY IF EXISTS "Productos activos públicos" ON productos;
DROP POLICY IF EXISTS "Admins ven todos los productos" ON productos;
DROP POLICY IF EXISTS "Admins pueden insertar productos" ON productos;
DROP POLICY IF EXISTS "Admins pueden actualizar productos" ON productos;
DROP POLICY IF EXISTS "Admins pueden eliminar productos" ON productos;

-- Usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON usuarios;
DROP POLICY IF EXISTS "Ver propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Actualizar propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins ven todos" ON usuarios;
DROP POLICY IF EXISTS "Admins pueden actualizar usuarios" ON usuarios;

-- Pedidos
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON pedidos;
DROP POLICY IF EXISTS "Sistema puede actualizar pedidos via webhook" ON pedidos;
DROP POLICY IF EXISTS "Admins pueden ver todos los pedidos" ON pedidos;
DROP POLICY IF EXISTS "Ver propios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Crear propios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Sistema actualiza pedidos" ON pedidos;
DROP POLICY IF EXISTS "Admins ven todos pedidos" ON pedidos;
DROP POLICY IF EXISTS "Admins actualizan pedidos" ON pedidos;

-- =====================================================
-- PASO 2: DESACTIVAR RLS TEMPORALMENTE
-- =====================================================

ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 3: REACTIVAR RLS
-- =====================================================

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 4: CREAR POLÍTICAS SIMPLES PARA PRODUCTOS
-- =====================================================

-- Permitir a TODOS ver productos activos (sin autenticación)
CREATE POLICY "public_select_productos" ON productos
  FOR SELECT
  TO public
  USING (activo = true);

-- Permitir a usuarios autenticados ver productos activos
CREATE POLICY "authenticated_select_productos" ON productos
  FOR SELECT
  TO authenticated
  USING (activo = true);

-- Permitir a service_role hacer todo (para admin panel)
CREATE POLICY "service_role_all_productos" ON productos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PASO 5: CREAR POLÍTICAS SIMPLES PARA USUARIOS
-- =====================================================

-- Permitir a usuarios autenticados ver su propio perfil
CREATE POLICY "authenticated_select_own_usuario" ON usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text);

-- Permitir a usuarios autenticados actualizar su propio perfil
CREATE POLICY "authenticated_update_own_usuario" ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Permitir a service_role hacer todo
CREATE POLICY "service_role_all_usuarios" ON usuarios
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PASO 6: CREAR POLÍTICAS SIMPLES PARA PEDIDOS
-- =====================================================

-- Permitir a usuarios autenticados ver sus propios pedidos
CREATE POLICY "authenticated_select_own_pedido" ON pedidos
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid()::text);

-- Permitir a usuarios autenticados crear sus propios pedidos
CREATE POLICY "authenticated_insert_own_pedido" ON pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid()::text);

-- Permitir a TODOS actualizar pedidos (para webhooks de MercadoPago)
CREATE POLICY "public_update_pedidos" ON pedidos
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Permitir a service_role hacer todo
CREATE POLICY "service_role_all_pedidos" ON pedidos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver políticas de productos
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'productos'
ORDER BY policyname;

-- Ver políticas de usuarios
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- Ver políticas de pedidos
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'pedidos'
ORDER BY policyname;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- Este script usa políticas SIMPLIFICADAS que:
-- 1. Permiten acceso público a productos activos
-- 2. Permiten a usuarios autenticados gestionar su perfil
-- 3. Permiten a usuarios autenticados gestionar sus pedidos
-- 4. Permiten a service_role (admin) hacer TODO
--
-- IMPORTANTE: El admin panel debe usar SUPABASE_SERVICE_ROLE_KEY
-- NO usar SUPABASE_ANON_KEY para operaciones de admin
-- =====================================================
