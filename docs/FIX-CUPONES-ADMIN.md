# 🔧 Solución: Panel de Admin - Cupones No Visibles

## 📋 Problema Identificado

El panel de admin no muestra los cupones ni permite agregar nuevos debido a que **las políticas RLS (Row Level Security) no estaban configuradas** para las tablas `cupones` y `cupones_usados`.

### Síntomas:
- ✅ La tabla existe en Supabase
- ✅ El componente React está correcto
- ❌ No se muestran cupones
- ❌ No se pueden crear cupones
- ❌ Error de permisos en consola

---

## ✅ Solución

### Paso 1: Ejecutar migración SQL

1. **Abre Supabase Dashboard** → Tu proyecto → **SQL Editor**
2. **Copia y pega** el contenido del archivo:
   ```
   sql-migrations/fix-cupones-rls.sql
   ```
3. **Ejecuta** el script (botón "Run")

### Paso 2: Verificar

Después de ejecutar, deberías ver:
```
✅ Row Level Security habilitado
✅ 5 políticas creadas para tabla 'cupones'
✅ 4 políticas creadas para tabla 'cupones_usados'
```

### Paso 3: Refrescar la app

1. Refresca tu navegador (F5)
2. Ve a **Panel Admin → Cupones**
3. Ahora deberías ver:
   - ✅ Cupones existentes (BIENVENIDA10, MERCADILLO20, DESCUENTO5)
   - ✅ Botón "Nuevo Cupón" funcionando
   - ✅ Editar/Eliminar funcionando

---

## 🔐 Políticas RLS Configuradas

### Para Tabla `cupones`:

1. **Visibilidad pública** - Usuarios autenticados pueden ver cupones activos
2. **Solo admins** - Pueden crear cupones
3. **Solo admins** - Pueden actualizar cupones
4. **Solo admins** - Pueden eliminar cupones
5. **Vista completa admin** - Admins ven todos los cupones (activos e inactivos)

### Para Tabla `cupones_usados`:

1. **Vista personal** - Usuarios ven sus propios cupones usados
2. **Vista admin** - Admins ven todos los cupones usados
3. **Registro de uso** - Sistema puede registrar cuando se usa un cupón
4. **Eliminación admin** - Solo admins pueden eliminar registros

---

## 🧪 Prueba Rápida

Después de la migración, prueba crear un cupón:

```
Código: TEST10
Tipo: Porcentaje
Valor: 10
Descripción: Cupón de prueba
Usos máximos: 5
Monto mínimo: 20
Activo: ✅
```

Si se crea exitosamente, ¡todo está funcionando! 🎉

---

## 📊 Cupones de Ejemplo

La migración original (`migration-cupones.sql`) ya insertó 3 cupones de ejemplo:

| Código | Tipo | Valor | Usos Máx. | Mínimo | Estado |
|--------|------|-------|-----------|--------|--------|
| BIENVENIDA10 | Porcentaje | 10% | 100 | S/ 50 | ✅ Activo |
| MERCADILLO20 | Porcentaje | 20% | 50 | S/ 100 | ✅ Activo |
| DESCUENTO5 | Monto Fijo | S/ 5 | Ilimitado | S/ 20 | ✅ Activo |

---

## 🔍 Troubleshooting

### Si aún no funciona:

1. **Verifica que eres admin:**
   ```sql
   SELECT id, email, rol FROM usuarios WHERE id = '<tu-clerk-id>';
   ```
   El `rol` debe ser `'admin'`

2. **Verifica las políticas:**
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename = 'cupones';
   ```
   Deberías ver 5 políticas

3. **Revisa la consola del navegador:**
   - Abre DevTools (F12)
   - Ve a la pestaña **Console**
   - Busca errores de Supabase

4. **Verifica la conexión:**
   ```typescript
   // En la consola del navegador
   console.log(await supabase.from('cupones').select('*'))
   ```

---

## 📝 Notas Técnicas

- **RLS (Row Level Security)** es una capa de seguridad de PostgreSQL que filtra resultados según el usuario autenticado
- Sin RLS configurado, Supabase **bloquea todo acceso** por defecto
- Las funciones RPC (`validar_cupon`, `registrar_uso_cupon`) ya estaban correctas
- El problema era solo de permisos de lectura/escritura

---

## ✨ Próximos Pasos Recomendados

Ahora que los cupones funcionan, considera agregar:

1. **Estadísticas en Dashboard** - Mostrar cupones más usados
2. **Alertas** - Notificar cuando un cupón se está agotando
3. **Exportar CSV** - Descargar reporte de cupones usados
4. **Cupones programados** - Activar/desactivar automáticamente por fecha
5. **Cupones únicos** - Generar códigos únicos por usuario

---

**Creado:** 4 de Octubre, 2025  
**Autor:** Sebastian Cabezas Q  
**Versión:** 1.0.0

