# 🚨 Solución Urgente: Cupones No Funcionan

## ❌ Errores Actuales

```
Error 400: Failed to load resource
Error obteniendo cupones: Object
Multiple GoTrueClient instances detected
```

---

## ✅ Solución en 3 Pasos

### 🔥 PASO 1: Ejecutar SQL en Supabase (URGENTE)

**IMPORTANTE:** Este SQL está corregido para funcionar con **Clerk** (que usa STRING IDs, no UUIDs).

1. **Abre Supabase Dashboard**
2. **Ve a SQL Editor** (icono de terminal en el menú izquierdo)
3. **Copia y pega** este SQL completo:

```sql
-- Fix: Políticas RLS para tabla cupones
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
```

4. **Presiona RUN** (botón verde arriba a la derecha)
5. **Verifica** que diga "Success" sin errores

---

### 🔧 PASO 2: Verificar que eres Admin

En Supabase SQL Editor, ejecuta:

```sql
-- Busca tu usuario (reemplaza con tu email de Clerk)
SELECT id, email, rol FROM usuarios WHERE email = 'tu-email@gmail.com';
```

**El campo `rol` DEBE ser `'admin'`**

Si NO es admin, ejecuta:

```sql
-- Reemplaza 'tu-clerk-id' con el ID que salió arriba
UPDATE usuarios SET rol = 'admin' WHERE id = 'tu-clerk-id';
```

---

### 🔄 PASO 3: Limpiar Cache y Refrescar

1. **En tu navegador:**
   - Abre DevTools (F12)
   - Ve a pestaña **Application** (o Aplicación)
   - En el menú izquierdo: **Storage** → **Clear site data**
   - Marca todo y presiona **Clear data**

2. **Cierra y reabre el navegador**

3. **Ve a tu app:**
   ```
   http://localhost:5173/admin/cupones
   ```

---

## ✅ Resultado Esperado

Deberías ver:

- ✅ 3 cupones de ejemplo (BIENVENIDA10, MERCADILLO20, DESCUENTO5)
- ✅ Botón "Nuevo Cupón" funcionando
- ✅ Sin errores en consola
- ✅ Estadísticas mostrándose

---

## 🔍 Si Aún No Funciona

### Verificar Políticas:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'cupones';
```

Deberías ver **5 políticas**.

### Verificar Cupones Existen:

```sql
SELECT codigo, tipo, valor, activo FROM cupones;
```

Deberías ver los 3 cupones de ejemplo.

### Test Manual:

En la consola del navegador (F12):

```javascript
// Test de lectura
const { data, error } = await supabase.from('cupones').select('*')
console.log('Cupones:', data, 'Error:', error)
```

Si sale error, cópialo y dímelo.

---

## 📝 Cambios Realizados en el Código

✅ **Archivos actualizados:**
- `src/lib/cupones.ts` - Cambio de import a `supabase` (singleton)
- `src/components/Admin/AdminCoupons.tsx` - Cambio de import a `supabase` (singleton)

Estos cambios ya están guardados, solo necesitas ejecutar el SQL.

---

## 💡 Explicación del Problema

1. **Error 400** = Supabase bloqueaba las queries porque RLS estaba habilitado pero sin políticas
2. **Multiple GoTrueClient** = Se solucionó usando el import correcto del singleton
3. **404 en /cupones** = Error irrelevante (ruta que no existe en tu app)

---

**IMPORTANTE:** Ejecuta el PASO 1 (SQL) AHORA MISMO para que funcione.

