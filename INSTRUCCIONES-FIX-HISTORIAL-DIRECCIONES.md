# 🔧 Instrucciones para Arreglar Historial y Direcciones

## 📋 Problema
Las tablas `historial_navegacion` y `direcciones_usuario` tienen la columna `usuario_id` como **UUID** pero necesitan ser **TEXT** para funcionar con Clerk IDs (como `user_32WWEmjUyEaZeFWSrcx17ZgG4UK`).

Esto causa el error:
```
invalid input syntax for type uuid: "user_32WWEmjUyEaZeFWSrcx17ZgG4UK"
```

## ✅ Solución

### Paso 1: Ir a Supabase Dashboard
1. Abre [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (en el menú lateral izquierdo)

### Paso 2: Ejecutar el Script SQL
1. Haz clic en "New Query" (o presiona Ctrl + Enter para nueva consulta)
2. Abre el archivo `fix-all-usuario-id-tables.sql` que está en la raíz del proyecto
3. Copia TODO el contenido del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **RUN** (o presiona Ctrl + Enter)

### Paso 3: Verificar que Funcionó
Deberías ver varios mensajes al final:
```
✅ Todas las tablas han sido actualizadas correctamente!
⚠️  Los datos anteriores fueron eliminados
🎯 Ahora usuario_id es TEXT en todas las tablas
```

Y una tabla mostrando:
| tabla                  | column_name | data_type | estado              |
|------------------------|-------------|-----------|---------------------|
| direcciones_usuario    | usuario_id  | text      | ✅ DESPUÉS         |
| historial_navegacion   | usuario_id  | text      | ✅ DESPUÉS         |

### Paso 4: Probar en la Aplicación
1. Recarga la página de tu aplicación (Ctrl + R o F5)
2. Visita un producto
3. Ve a la página de Historial
4. **NO deberían aparecer errores en la consola**
5. Ve a la página de Direcciones
6. Intenta agregar una nueva dirección
7. **Debería funcionar sin errores**

## ⚠️ Advertencias

- **Este script ELIMINARÁ todos los datos** de `historial_navegacion` y `direcciones_usuario`
- Los datos de `lista_deseos` NO se verán afectados (ya fue arreglado anteriormente)
- Después de ejecutar el script, las tablas estarán vacías pero funcionarán correctamente

## 🎯 ¿Qué hace el script?

1. **Verifica** el estado actual (usuario_id debería estar como UUID)
2. **Elimina** las tablas `historial_navegacion` y `direcciones_usuario`
3. **Recrea** las tablas con `usuario_id` como TEXT
4. **Configura** todos los índices, triggers y políticas RLS correctamente
5. **Verifica** que todo quedó como TEXT

## 💡 Después de ejecutar

Una vez ejecutado el script:
- ✅ El historial de navegación funcionará correctamente
- ✅ Las direcciones funcionarán correctamente
- ✅ La lista de deseos seguirá funcionando (ya estaba bien)
- ✅ Todo usará el mismo tipo de ID (TEXT) de Clerk

## 🆘 Si algo sale mal

Si ves algún error al ejecutar el script:
1. Copia el mensaje de error completo
2. Compártelo conmigo
3. NO ejecutes el script de nuevo hasta que veamos el error

## 📝 Notas

- Este problema ocurrió porque se ejecutó `fix-usuario-id-SIMPLE.sql` que solo arreglaba `lista_deseos`
- El script `fix-all-usuario-id-tables.sql` es la solución completa
- Solo necesitas ejecutar este script UNA vez
