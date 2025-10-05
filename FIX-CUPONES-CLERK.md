# 🚨 ERROR RESUELTO: Cupones Admin Panel

## ❌ Error Original
```
invalid input syntax for type uuid: "user_32WWEmjUyEaZeFWSrcx17ZgG4UK"
Error 400: Failed to load resource
```

## 🔍 Causa del Problema

**Clerk usa STRING IDs** (como `user_32WWEmj...`) pero las políticas RLS estaban usando `auth.uid()` que intenta convertir a UUID de Supabase.

**Solución:** Usar `current_setting('request.jwt.claims', true)::json->>'sub'` para obtener el Clerk ID del JWT.

---

## ✅ SOLUCIÓN INMEDIATA

### Paso 1: Ejecutar SQL Corregido

1. **Abre Supabase Dashboard** → Tu proyecto
2. **Ve a SQL Editor** (menú lateral izquierdo)
3. **Copia TODO este SQL:**

```sql
-- Fix: Políticas RLS para tabla cupones (CORREGIDO PARA CLERK)
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
-- IMPORTANTE: Clerk usa STRING IDs, obtenemos el ID del JWT claim
CREATE POLICY "Solo admins pueden crear cupones"
  ON cupones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')
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
      WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')
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
      WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')
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
      WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')
      AND rol = 'admin'
    )
  );

-- POLÍTICAS PARA TABLA CUPONES_USADOS

-- 1. Usuarios pueden ver sus propios usos de cupones
CREATE POLICY "Usuarios pueden ver sus propios cupones usados"
  ON cupones_usados FOR SELECT
  TO authenticated
  USING (usuario_id = (current_setting('request.jwt.claims', true)::json->>'sub'));

-- 2. Admins pueden ver todos los cupones usados
CREATE POLICY "Admins pueden ver todos los cupones usados"
  ON cupones_usados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')
      AND rol = 'admin'
    )
  );

-- 3. Sistema puede insertar registros de uso (a través de función RPC)
CREATE POLICY "Sistema puede registrar uso de cupones"
  ON cupones_usados FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = (current_setting('request.jwt.claims', true)::json->>'sub'));

-- 4. Admins pueden eliminar registros de uso
CREATE POLICY "Admins pueden eliminar cupones usados"
  ON cupones_usados FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')
      AND rol = 'admin'
    )
  );

-- Verificar políticas creadas
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('cupones', 'cupones_usados')
ORDER BY tablename, policyname;
```

4. **Pega** en el SQL Editor de Supabase
5. **Presiona RUN** (botón verde)
6. **Espera** el mensaje "Success"

---

### Paso 2: Verificar que Eres Admin

En Supabase SQL Editor, ejecuta:

```sql
-- Busca tu usuario (con tu Clerk ID)
SELECT id, email, rol 
FROM usuarios 
WHERE id LIKE 'user_%'
ORDER BY created_at DESC 
LIMIT 5;
```

**Si tu `rol` NO es `'admin'`, ejecuta:**

```sql
-- Reemplaza 'user_TU_ID' con tu ID real
UPDATE usuarios 
SET rol = 'admin' 
WHERE id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';
```

---

### Paso 3: Refrescar App

1. **Cierra la pestaña** del navegador
2. **Abre de nuevo** tu app
3. **Ve a:** `/admin/cupones`

**Deberías ver:**
- ✅ 3 cupones de ejemplo
- ✅ Botón "Nuevo Cupón" funcionando
- ✅ Sin errores en consola

---

## 🔍 Verificación

Si aún falla, ejecuta en Supabase SQL Editor:

```sql
-- Ver políticas creadas
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'cupones';

-- Debería mostrar 5 políticas
```

---

## 📝 Cambios Técnicos

### Antes (❌ No funcionaba):
```sql
WHERE id = auth.uid()::text  -- auth.uid() devuelve NULL con Clerk
```

### Ahora (✅ Funciona):
```sql
WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')
-- Obtiene el Clerk ID del JWT: "user_32WWEmj..."
```

---

## 💡 Explicación

**Supabase Auth** usa UUIDs internos como `550e8400-e29b-41d4-a716-446655440000`

**Clerk** usa STRING IDs como `user_32WWEmjUyEaZeFWSrcx17ZgG4UK`

Cuando usas Clerk, el JWT tiene el `sub` claim con tu Clerk ID. Las políticas RLS deben extraerlo con:
```sql
current_setting('request.jwt.claims', true)::json->>'sub'
```

---

**IMPORTANTE:** El archivo `sql-migrations/fix-cupones-rls.sql` ya está actualizado con la solución correcta.

Solo ejecuta el SQL en Supabase y ¡listo! 🎉

