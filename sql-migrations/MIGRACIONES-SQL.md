# 📁 Migraciones SQL - Mercadillo

Esta carpeta contiene todas las migraciones de base de datos de Supabase.

---

## ✅ Migraciones Aplicadas (En Orden)

### 1. Schema Principal
**Archivo:** `supabase-schema.sql`  
**Fecha:** Septiembre 30, 2025  
**Descripción:** Schema inicial completo con:
- Tabla `usuarios`
- Tabla `productos`
- Tabla `pedidos`
- Tabla `historial_navegacion`
- Tabla `chats`
- Tabla `mensajes`
- RLS policies iniciales

---

### 2. Sistema de Reseñas
**Archivo:** `supabase-reviews-migration.sql`  
**Fecha:** Septiembre 30, 2025  
**Descripción:** 
- Tabla `resenas` con relación a productos y usuarios
- RLS policies para reseñas
- Índices de performance

---

### 3. Sistema de Cupones
**Archivo:** `migration-cupones.sql`  
**Fecha:** Octubre 4, 2025  
**Descripción:**
- Tabla `cupones` con validación
- Función `validar_cupon(codigo, usuario_id, total)`
- RLS policies para cupones
- Triggers de validación

**Fix relacionado:** `fix-cupones-function.sql` (corrige validación)

---

### 4. Integración MercadoPago
**Archivo:** `migration-add-mercadopago.sql`  
**Fecha:** Septiembre 30, 2025  
**Descripción:**
- Campo `preferencia_id` en tabla `pedidos`
- Campo `tipo_pago` (stripe, mercadopago)
- Índices para búsquedas rápidas

---

### 5. Tracking de Pedidos
**Archivo:** `migration-add-order-tracking.sql`  
**Fecha:** Octubre 4, 2025  
**Descripción:**
- Campos de tracking: `fecha_confirmacion`, `fecha_envio`, `fecha_entrega`
- Campo `numero_seguimiento`
- Estados de pedido mejorados

---

### 6. Cupones en Pedidos
**Archivo:** `migration-add-cupones-to-pedidos.sql`  
**Fecha:** Octubre 4, 2025  
**Descripción:**
- Campo `cupon_codigo` en tabla `pedidos`
- Campo `descuento` en tabla `pedidos`
- Relación con tabla cupones

---

### 7. Sistema de Chat (Gemini AI)
**Archivo:** `supabase-chat-migrations.sql`  
**Fecha:** Octubre 3, 2025  
**Descripción:**
- Mejoras en tabla `chats`
- Mejoras en tabla `mensajes`
- Políticas RLS para chatbot
- Índices de búsqueda

---

## 🔧 Scripts de Corrección

### `fix-rls-DISABLE.sql`
**Fecha:** Octubre 3, 2025  
**Uso:** Deshabilitar RLS temporalmente para debugging (⚠️ NO usar en producción)

### `fix-cupones-function.sql`
**Fecha:** Octubre 4, 2025  
**Uso:** Corrige validación de la función `validar_cupon`

---

## 📋 Cómo Aplicar Migraciones

### Opción 1: SQL Editor (Recomendado)
1. Ir a https://supabase.com/dashboard
2. Proyecto: `xwubnuokmfghtyyfpgtl`
3. SQL Editor → New Query
4. Copiar contenido del archivo `.sql`
5. Run

### Opción 2: CLI
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link proyecto
supabase link --project-ref xwubnuokmfghtyyfpgtl

# Aplicar migración
supabase db push
```

---

## ⚠️ Advertencias

1. **No aplicar migraciones duplicadas** - Verificar si ya están aplicadas
2. **Backup antes de migrar** - Especialmente en producción
3. **Probar en desarrollo** - Antes de aplicar en prod
4. **Orden importa** - Aplicar en orden cronológico

---

## 🔍 Verificar Migraciones Aplicadas

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver columnas de una tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- Ver funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

---

## 📊 Estado Actual (Octubre 4, 2025)

✅ Todas las migraciones aplicadas  
✅ Base de datos funcionando correctamente  
✅ RLS policies activas  
✅ Índices creados  
✅ Funciones SQL funcionando  

---

**Próxima migración:** TBD
