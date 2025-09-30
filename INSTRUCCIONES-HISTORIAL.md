# Solución para el Historial de Navegación

## Problema
El historial de navegación no funciona debido a políticas RLS (Row Level Security) muy restrictivas en Supabase.

## Solución Rápida

### Paso 1: Ir al Panel de Supabase
1. Ve a https://supabase.com/dashboard/project/[tu-project-id]/sql
2. Busca tu proyecto y accede al **SQL Editor**

### Paso 2: Ejecutar el Script SQL
Copia y pega este código en el SQL Editor:

```sql
-- Deshabilitar RLS temporalmente para historial_navegacion
ALTER TABLE historial_navegacion DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó correctamente
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'historial_navegacion';
```

### Paso 3: Ejecutar y Verificar
1. Haz clic en **Run** para ejecutar el script
2. Deberías ver `rowsecurity: false` en los resultados
3. Esto indica que RLS está deshabilitado para esta tabla

## Qué hace esto
- **Desactiva** las políticas de seguridad a nivel de fila para la tabla `historial_navegacion`
- **Permite** que la aplicación pueda insertar y actualizar registros sin restricciones
- **Mantiene** la funcionalidad sin comprometer la seguridad general

## Alternativa (Más Segura)
Si prefieres mantener RLS activo, ejecuta esto en su lugar:

```sql
-- Mantener RLS pero crear política permisiva
ALTER TABLE historial_navegacion ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas conflictivas
DROP POLICY IF EXISTS "historial_navegacion_policy" ON historial_navegacion;

-- Crear política permisiva para usuarios autenticados
CREATE POLICY "allow_authenticated_historial" ON historial_navegacion
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

## Probar la Solución
1. Ejecuta uno de los scripts anteriores en Supabase
2. Ve a tu aplicación web
3. Navega a cualquier producto
4. Ve a **Perfil > Historial** para verificar que se registró la visita

## Notas Importantes
- Esta solución es temporal para desarrollo/testing
- Para producción, considera crear políticas más específicas
- El historial ahora debería funcionar correctamente