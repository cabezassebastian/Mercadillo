-- ============================================
-- SOLUCIÓN FINAL: Eliminar TODAS las políticas RLS problemáticas
-- y crear políticas simples que permitan acceso con Service Role
-- ============================================

-- PASO 1: Eliminar TODAS las políticas existentes
-- ============================================

-- Productos
DROP POLICY IF EXISTS "public_select_productos" ON productos;
DROP POLICY IF EXISTS "authenticated_select_productos" ON productos;
DROP POLICY IF EXISTS "service_role_all_productos" ON productos;
DROP POLICY IF EXISTS "Admins pueden insertar productos" ON productos;
DROP POLICY IF EXISTS "Admins pueden actualizar productos" ON productos;
DROP POLICY IF EXISTS "Admins pueden eliminar productos" ON productos;
DROP POLICY IF EXISTS "Todos pueden ver productos activos" ON productos;
DROP POLICY IF EXISTS "Admins pueden ver todos los productos" ON productos;

-- Usuarios
DROP POLICY IF EXISTS "authenticated_select_own_usuarios" ON usuarios;
DROP POLICY IF EXISTS "authenticated_update_own_usuarios" ON usuarios;
DROP POLICY IF EXISTS "service_role_all_usuarios" ON usuarios;
DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON usuarios;
DROP POLICY IF EXISTS "Admins pueden actualizar usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;

-- Pedidos
DROP POLICY IF EXISTS "authenticated_select_own_pedidos" ON pedidos;
DROP POLICY IF EXISTS "authenticated_insert_own_pedidos" ON pedidos;
DROP POLICY IF EXISTS "public_update_pedidos" ON pedidos;
DROP POLICY IF EXISTS "service_role_all_pedidos" ON pedidos;
DROP POLICY IF EXISTS "Admins pueden ver todos los pedidos" ON pedidos;
DROP POLICY IF EXISTS "Admins pueden actualizar pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON pedidos;
DROP POLICY IF EXISTS "Sistema puede actualizar estado de pedidos" ON pedidos;

-- PASO 2: DESACTIVAR RLS temporalmente para limpiar estado
-- ============================================
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;

-- PASO 3: REACTIVAR RLS
-- ============================================
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas SUPER SIMPLES
-- ============================================

-- PRODUCTOS: Permisivo para todos
-- ============================================
CREATE POLICY "allow_all_productos" ON productos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- USUARIOS: Permisivo para todos
-- ============================================
CREATE POLICY "allow_all_usuarios" ON usuarios
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- PEDIDOS: Permisivo para todos
-- ============================================
CREATE POLICY "allow_all_pedidos" ON pedidos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- PASO 5: Verificar que las políticas se crearon correctamente
-- ============================================
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
WHERE tablename IN ('productos', 'usuarios', 'pedidos')
ORDER BY tablename, policyname;

-- ============================================
-- RESULTADO ESPERADO: 
-- Deberías ver 3 políticas (una por tabla) llamadas "allow_all_*"
-- Todas deben tener permissive = 'PERMISSIVE' y cmd = 'ALL'
-- ============================================
