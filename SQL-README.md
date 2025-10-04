# 📚 Documentación SQL - Mercadillo

> Guía de referencia de todos los scripts SQL necesarios para configurar la base de datos

---

## 📁 Archivos SQL Disponibles

### 1. ✅ `supabase-schema.sql` (PRINCIPAL)
**Descripción:** Schema completo de la base de datos  
**Cuándo ejecutar:** Al crear el proyecto por primera vez  
**Contiene:**
- Tablas: `usuarios`, `productos`, `pedidos`, `reseñas`, `direcciones`, `categorias`
- Índices para performance
- Constraints y relaciones

**Ejecución:**
```sql
-- Copiar y pegar COMPLETO en Supabase SQL Editor
-- Ejecutar una sola vez
```

---

### 2. ✅ `supabase-chat-migrations.sql` (CHATBOT)
**Descripción:** Migraciones para el chatbot AI  
**Cuándo ejecutar:** Después del schema principal  
**Contiene:**
- Tabla: `chat_conversations`
- Índices para queries rápidas
- Columnas: `usuario_id`, `mensaje`, `respuesta`, `productos_mencionados`, `producto_agregado_carrito`

**Ejecución:**
```sql
-- Ejecutar DESPUÉS de supabase-schema.sql
```

---

### 3. ✅ `fix-rls-DISABLE.sql` (SEGURIDAD)
**Descripción:** Desactiva RLS (Row Level Security)  
**Cuándo ejecutar:** Después de las migraciones  
**Contiene:**
- DROP de todas las políticas RLS existentes
- DISABLE ROW LEVEL SECURITY en: `productos`, `usuarios`, `pedidos`
- Query de verificación

**Por qué desactivar RLS:**
- Simplicidad en la arquitectura
- Autenticación manejada por Clerk
- Panel de admin usa Service Role Key
- Menos complejidad de debugging

**Ejecución:**
```sql
-- Ejecutar ÚLTIMO, después de todas las migraciones
-- Verificar que muestre: rowsecurity = false
```

---

### 4. 🔧 `migration-add-mercadopago.sql` (PAGOS)
**Descripción:** Agrega campos de MercadoPago a pedidos  
**Cuándo ejecutar:** Solo si actualizas desde versión anterior  
**Contiene:**
- Columnas: `mercadopago_preference_id`, `mercadopago_payment_id`, `mercadopago_payment_status`

**Ejecución:**
```sql
-- Solo si NO está en supabase-schema.sql
-- Verificar primero: SELECT column_name FROM information_schema.columns WHERE table_name='pedidos';
```

---

### 5. 📝 `supabase-reviews-migration.sql` (RESEÑAS)
**Descripción:** Migración para sistema de reseñas  
**Cuándo ejecutar:** Solo si actualizas desde versión anterior  
**Contiene:**
- Tabla `reseñas` (ya incluida en schema principal)
- Índices y constraints

**Ejecución:**
```sql
-- Solo si NO tienes tabla reseñas
-- Verificar: SELECT * FROM reseñas LIMIT 1;
```

---

## 🚀 Orden de Ejecución Recomendado

### Para Proyecto Nuevo (Desde Cero)

```bash
# 1. Schema principal
supabase-schema.sql ✅

# 2. Chatbot
supabase-chat-migrations.sql ✅

# 3. Desactivar RLS
fix-rls-DISABLE.sql ✅

# LISTO! ✅
```

### Para Proyecto Existente (Actualización)

```bash
# Verificar qué falta y ejecutar solo lo necesario

# Si falta tabla chat_conversations:
supabase-chat-migrations.sql

# Si faltan campos de MercadoPago:
migration-add-mercadopago.sql

# Siempre al final:
fix-rls-DISABLE.sql ✅
```

---

## 🔍 Verificación Post-Ejecución

### Verificar Tablas Creadas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Resultado esperado:**
- ✅ `usuarios`
- ✅ `productos`
- ✅ `pedidos`
- ✅ `reseñas`
- ✅ `direcciones`
- ✅ `chat_conversations`

### Verificar RLS Desactivado
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('productos', 'usuarios', 'pedidos')
ORDER BY tablename;
```

**Resultado esperado:**
```
tablename  | rowsecurity
-----------+------------
pedidos    | false
productos  | false
usuarios   | false
```

### Verificar Índices
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 📊 Schema Visual

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  usuarios   │◄──────│   pedidos    │──────►│   productos │
└─────────────┘       └──────────────┘       └─────────────┘
      │                      │                       │
      │                      │                       │
      ▼                      ▼                       ▼
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│ direcciones │       │ mercadopago  │       │   reseñas   │
└─────────────┘       │   (campos)   │       └─────────────┘
                      └──────────────┘
                             
┌──────────────────────┐
│ chat_conversations   │  ← Chatbot AI
└──────────────────────┘
```

---

## 🛠️ Scripts Útiles de Mantenimiento

### Crear Usuario Admin
```sql
UPDATE usuarios 
SET rol = 'admin' 
WHERE email = 'tu-email@example.com';
```

### Ver Todos los Pedidos
```sql
SELECT 
  p.id, 
  u.nombre || ' ' || u.apellido AS cliente,
  p.total,
  p.estado,
  p.created_at
FROM pedidos p
JOIN usuarios u ON p.usuario_id = u.id
ORDER BY p.created_at DESC
LIMIT 20;
```

### Ver Productos Más Vendidos
```sql
SELECT 
  pr.nombre,
  COUNT(pe.id) AS total_ventas,
  SUM(pr.precio) AS ingresos
FROM productos pr
JOIN pedidos pe ON pe.items::jsonb @> json_build_array(json_build_object('id', pr.id))::jsonb
WHERE pe.estado = 'completado'
GROUP BY pr.id, pr.nombre
ORDER BY total_ventas DESC
LIMIT 10;
```

### Limpiar Conversaciones Viejas del Chatbot
```sql
-- Eliminar conversaciones de más de 90 días
DELETE FROM chat_conversations
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 🔧 Troubleshooting

### Error: "relation already exists"
**Causa:** Intentas crear una tabla que ya existe  
**Solución:** Verificar con `SELECT * FROM <tabla> LIMIT 1;` antes de ejecutar

### Error: "must be owner of table"
**Causa:** Permisos insuficientes  
**Solución:** Usar el SQL Editor de Supabase Dashboard (tiene permisos de superusuario)

### Error: "column does not exist"
**Causa:** Migración no se ejecutó correctamente  
**Solución:** Verificar columnas existentes:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = '<tabla>';
```

---

## 📝 Notas Importantes

- ⚠️ **SIEMPRE hacer backup** antes de ejecutar scripts en producción
- ✅ **Probar en Supabase local** primero si es posible
- 📊 **Verificar resultados** después de cada script
- 🔒 **RLS desactivado** es intencional para esta arquitectura
- 🤖 **Chatbot requiere** `chat_conversations` table

---

## 🔗 Enlaces Útiles

- [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)

---

**Última actualización:** Octubre 2025  
**Mantenedor:** Sebastian CQ
