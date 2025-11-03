# Implementación de URLs Amigables con Slugs

## ✅ Cambios Completados

Se ha implementado un sistema completo de URLs amigables para SEO usando **slugs únicos** en lugar de UUIDs.

### **Antes**
```
/producto/0577fd62-5c9b-4e51-9a49-3f8b2d1e4a7c
/producto/pelado-nuevo-0577fd62
```

### **Ahora (después de ejecutar la migración SQL)**
```
/producto/pelado-nuevo
/producto/camisa-azul
/producto/zapatillas-deportivas
```

---

## 📝 Archivos Modificados

### **1. Sistema de Slugificación**
- ✅ **`src/lib/slugify.ts`** - Actualizado
  - `slugify()`: Convierte texto a formato URL-friendly
  - `getProductUrl()`: Genera URLs con slug únicamente
  - `extractProductIdOrSlug()`: Extrae UUID o slug desde la URL
  - **Compatibilidad hacia atrás**: Soporta URLs antiguas con UUID

### **2. Interfaces TypeScript**
- ✅ **`src/lib/supabase.ts`** - Campo `slug?: string` agregado a `Producto`
- ✅ **`src/lib/userProfile.ts`** - Campo `slug?: string` agregado a `NavigationHistoryItem.producto`
- ✅ **`src/pages/ReviewsPage.tsx`** - Campo `slug?: string` agregado a `UserReview.producto`
- ✅ **`src/components/Admin/TopProducts.tsx`** - Campo `slug?: string` agregado a `TopProduct`

### **3. Componentes Actualizados**
Todos los componentes ahora usan `producto.slug || producto.id` para máxima compatibilidad:

- ✅ **`src/components/Product/ProductCard.tsx`** (vista grid y lista)
- ✅ **`src/components/Product/RelatedProducts.tsx`**
- ✅ **`src/pages/Product.tsx`** (ShareButtons)
- ✅ **`src/pages/ReviewsPage.tsx`**
- ✅ **`src/pages/HistoryPage.tsx`** (2 instancias)
- ✅ **`src/pages/Cart.tsx`** (2 instancias)
- ✅ **`src/components/ChatBot/ChatMessage.tsx`** (productos recomendados)
- ✅ **`src/components/Admin/TopProducts.tsx`**
- ✅ **`src/components/Home/RecommendedForYou.tsx`** (ya estaba actualizado)

---

## 🗄️ Migración de Base de Datos

### **Archivo SQL Creado**
📄 **`sql-migrations/add-product-slug.sql`**

### **Qué hace el script:**
1. **Agrega columna `slug`** a la tabla `productos`
2. **Genera slugs automáticamente** para todos los productos existentes
3. **Crea índice único** en la columna `slug`
4. **Crea función PostgreSQL** `generate_product_slug()` que:
   - Convierte el nombre a formato URL-friendly
   - Elimina tildes/acentos
   - Reemplaza espacios con guiones
   - Convierte a minúsculas
   - Detecta duplicados y agrega sufijo del UUID
5. **Crea trigger** que ejecuta la función automáticamente en INSERT/UPDATE

---

## 🚀 Pasos para Ejecutar la Migración

### **Paso 1: Hacer Commit de los Cambios de TypeScript**
```powershell
git add .
git commit -m "feat: implement SEO-friendly slug URLs"
git push
```

### **Paso 2: Ejecutar la Migración SQL en Supabase**

1. **Abre Supabase Dashboard**: https://app.supabase.com
2. **Selecciona tu proyecto**: `Mercadillo`
3. **Ve a SQL Editor** (icono de base de datos en el menú lateral)
4. **Crea un nuevo query**
5. **Copia y pega** todo el contenido de `sql-migrations/add-product-slug.sql`
6. **Ejecuta** el script (botón ▶️ Run o `Ctrl+Enter`)

### **Paso 3: Verificar la Migración**

```sql
-- Verifica que todos los productos tienen slug
SELECT id, nombre, slug FROM productos LIMIT 10;

-- Verifica que no hay slugs duplicados
SELECT slug, COUNT(*) FROM productos GROUP BY slug HAVING COUNT(*) > 1;

-- Prueba el trigger creando un producto nuevo
INSERT INTO productos (nombre, descripcion, precio, imagen, categoria)
VALUES ('Producto de Prueba', 'Descripción', 100, 'imagen.jpg', 'test');

-- Verifica que el slug se generó automáticamente
SELECT nombre, slug FROM productos WHERE nombre = 'Producto de Prueba';
```

---

## 🔄 Compatibilidad Hacia Atrás

El sistema está diseñado para ser **100% compatible** con URLs antiguas:

### **URLs Soportadas**
```typescript
/producto/pelado-nuevo              // ✅ Nuevo formato (slug únicamente)
/producto/pelado-nuevo-0577fd62     // ✅ Formato anterior (slug-uuid)
/producto/0577fd62-5c9b-4e51-...    // ✅ Formato UUID original
```

### **Lógica de Extracción**
```typescript
// src/lib/slugify.ts - extractProductIdOrSlug()

if (isUUID(slugWithId)) {
  return slugWithId  // UUID puro → buscar por ID
}

if (slugWithId.includes('-') && hasUUIDPart) {
  return extractedUUID  // slug-uuid → extraer UUID
}

return slugWithId  // slug puro → buscar por slug
```

---

## 🎯 Comportamiento del Sistema

### **Para Productos Nuevos**
- Al crear un producto, el trigger `set_product_slug` genera automáticamente el slug
- El slug se deriva del campo `nombre`
- Si existe duplicado, se agrega un sufijo del UUID (ej: `pelado-nuevo-0577`)

### **Para Productos Existentes**
- La migración SQL actualiza todos los productos con slugs generados
- Los componentes intentan usar `producto.slug` primero
- Si `slug` es `null/undefined`, usan `producto.id` como fallback

### **Búsqueda de Productos**
```typescript
// src/pages/Product.tsx

const { id: slugOrId } = useParams()
const id = slugOrId ? extractProductIdOrSlug(slugOrId) : undefined

// Consulta a Supabase
const { data } = await supabase
  .from('productos')
  .select()
  .or(`id.eq.${id},slug.eq.${id}`)  // ← Busca por ID o por slug
  .single()
```

---

## 🧪 Testing Post-Migración

### **1. Probar URLs Nuevas**
```
https://mercadillo.app/producto/pelado-nuevo
https://mercadillo.app/producto/camisa-azul
```

### **2. Probar Compatibilidad**
```
https://mercadillo.app/producto/0577fd62-5c9b-4e51-9a49-3f8b2d1e4a7c (UUID antiguo)
https://mercadillo.app/producto/pelado-nuevo-0577fd62 (formato anterior)
```

### **3. Verificar Botones de Compartir**
- Abrir cualquier producto
- Hacer clic en botones de compartir (WhatsApp, Facebook, etc.)
- Verificar que la URL compartida sea `/producto/slug` (sin UUID)

### **4. Verificar Links en la App**
- Carrito de compras
- Historial de navegación
- Productos relacionados
- Reseñas de usuarios
- Chatbot (productos recomendados)
- Panel de admin (Top Products)

---

## 📊 Ejemplo de Migración

### **Antes (en la BD)**
```sql
id                                   | nombre         | slug
-------------------------------------|----------------|------
0577fd62-5c9b-4e51-9a49-3f8b2d1e4a7c | Pelado Nuevo   | NULL
a1b2c3d4-5e6f-7890-abcd-ef1234567890 | Camisa Azul    | NULL
```

### **Después de Ejecutar add-product-slug.sql**
```sql
id                                   | nombre         | slug
-------------------------------------|----------------|------------------
0577fd62-5c9b-4e51-9a49-3f8b2d1e4a7c | Pelado Nuevo   | pelado-nuevo
a1b2c3d4-5e6f-7890-abcd-ef1234567890 | Camisa Azul    | camisa-azul
```

### **Si Hay Duplicados**
```sql
-- Dos productos con el mismo nombre
INSERT INTO productos (nombre, ...) VALUES ('Pelado Nuevo', ...);
INSERT INTO productos (nombre, ...) VALUES ('Pelado Nuevo', ...);

-- Resultado automático con el trigger
id                 | nombre         | slug
-------------------|----------------|------------------
...abc             | Pelado Nuevo   | pelado-nuevo
...def             | Pelado Nuevo   | pelado-nuevo-def  ← sufijo agregado
```

---

## 🛡️ Seguridad y RLS

El sistema de slugs **NO afecta** las políticas de Row Level Security (RLS) de Supabase:

- ✅ Los slugs son públicos (igual que los UUIDs eran públicos en las URLs)
- ✅ Las políticas RLS siguen aplicándose normalmente
- ✅ Los usuarios solo pueden ver/editar productos según sus permisos

---

## 📈 Beneficios SEO

### **Mejoras para SEO**
1. **URLs descriptivas**: `/producto/zapatillas-nike-air` vs `/producto/abc-123-def`
2. **Keywords en URL**: Los motores de búsqueda indexan mejor palabras clave
3. **Mejor CTR**: URLs legibles aumentan los clics en resultados de búsqueda
4. **Compartir en redes**: URLs más amigables al compartir en WhatsApp, Facebook, etc.

### **Google Search Console**
- Las URLs nuevas serán indexadas progresivamente
- Las URLs antiguas seguirán funcionando (301 redirect no necesario)
- Los links externos antiguos seguirán funcionando

---

## 🔧 Mantenimiento Futuro

### **Actualizar un Slug Manualmente**
```sql
UPDATE productos 
SET slug = 'nuevo-slug-personalizado' 
WHERE id = 'abc-123-def';
```

### **Regenerar Todos los Slugs**
```sql
UPDATE productos 
SET slug = generate_product_slug();
```

### **Ver Productos sin Slug**
```sql
SELECT id, nombre, slug 
FROM productos 
WHERE slug IS NULL;
```

---

## ❓ FAQ

### **¿Qué pasa si cambio el nombre de un producto?**
El trigger actualizará el slug automáticamente. Si el nuevo slug existe, agregará un sufijo.

### **¿Puedo personalizar un slug?**
Sí, puedes actualizar manualmente el campo `slug` en Supabase.

### **¿Los links antiguos dejarán de funcionar?**
No, el sistema soporta URLs antiguas con UUID gracias a `extractProductIdOrSlug()`.

### **¿Qué pasa si dos productos tienen el mismo nombre?**
El trigger detecta duplicados y agrega automáticamente un sufijo del UUID.

### **¿Necesito actualizar algo más después de la migración?**
No, todo el código frontend ya está actualizado y listo para usar slugs.

---

## 🎉 Resultado Final

Una vez ejecutada la migración SQL, todas las URLs de productos serán:

```
✅ /producto/pelado-nuevo
✅ /producto/camisa-azul-xl
✅ /producto/zapatillas-nike-air-max
✅ /producto/laptop-dell-inspiron-15
```

**¡Mucho mejor que UUIDs para SEO!** 🚀
