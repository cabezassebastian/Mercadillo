# 📦 Sistema de Variantes Mejorado

## 🎯 Resumen de Cambios

El sistema de variantes ha sido completamente rediseñado para ser más intuitivo y funcional. Ahora tiene 3 pasos claros y una integración completa con el panel de pedidos.

## ✨ Mejoras Implementadas

### 1. **Interfaz Paso a Paso**

El editor de variantes ahora tiene 3 pasos claros:

#### **Paso 1: Opciones**
- Define las características que varían (ej: Talla, Color, Material)
- Plantillas rápidas para ropa (Talla + Color)
- Vista clara de todas las opciones creadas

#### **Paso 2: Valores**
- Agrega los valores específicos para cada opción
- Para tallas: XS, S, M, L, XL, XXL
- Para colores: Soporta nombres o códigos hex (#ff0000)
- Botón de visibilidad para ocultar valores sin eliminarlos
- Vista previa de colores con círculos de color

#### **Paso 3: Inventario**
- Genera automáticamente todas las combinaciones posibles
- Tabla clara con todas las variantes
- Edita precio y stock de cada variante individualmente
- Activa/desactiva variantes según disponibilidad
- Los cambios se guardan automáticamente

### 2. **Mejoras en Base de Datos**

#### **Nueva Vista SQL: `variantes_con_detalles`**
```sql
SELECT * FROM variantes_con_detalles WHERE product_id = 'xxx';
```

Retorna:
- `variante_id`: UUID de la variante
- `variante_nombre`: Nombre legible (ej: "Talla: M, Color: Rojo")
- `price`, `stock`, `is_active`, `sku`
- `opciones_detalle`: JSON con detalles completos de cada opción

#### **Nuevas Funciones SQL**

**`get_product_variants_detailed(product_uuid)`**
```sql
SELECT * FROM get_product_variants_detailed('producto-id');
```
Obtiene todas las variantes de un producto con nombres legibles.

**`find_variant_by_options(product_uuid, selected_option_value_ids[])`**
```sql
SELECT * FROM find_variant_by_options(
  'producto-id',
  ARRAY['option-value-id-1', 'option-value-id-2']
);
```
Encuentra la variante exacta que coincide con las opciones seleccionadas.

**`check_variant_stock(product_uuid, variant_uuid, quantity)`**
```sql
SELECT check_variant_stock('producto-id', 'variante-id', 3);
```
Valida si hay stock suficiente de una variante antes de agregar al carrito.

### 3. **Integración con Pedidos**

Ahora los pedidos muestran claramente las variantes seleccionadas:

**En el Panel de Admin (AdminOrders)**:
- 📋 Nombre de la variante con badges por opción
- 🏷️ SKU de la variante (si existe)
- 🎨 Colores visualizados con círculos de color
- 💰 Precio específico de la variante

**Estructura de Item en Pedido**:
```typescript
interface PedidoItem {
  producto_id: string
  cantidad: number
  precio: number
  nombre: string
  imagen: string
  variant_id?: string        // ✨ NUEVO
  variant_name?: string      // ✨ NUEVO (ej: "Talla: M, Color: Rojo")
  sku?: string              // ✨ NUEVO
  opciones?: Array<{        // ✨ NUEVO
    option_name: string
    option_value: string
    metadata?: { hex?: string }
  }>
}
```

### 4. **Nuevos Índices de Rendimiento**

```sql
-- Mejorar búsquedas de variantes activas
CREATE INDEX idx_product_variants_product_active 
ON product_variants(product_id, is_active) 
WHERE is_active = true;

-- Mejorar búsquedas de opciones por producto
CREATE INDEX idx_product_options_product 
ON product_options(product_id);

-- Mejorar búsquedas de valores por opción
CREATE INDEX idx_product_option_values_option 
ON product_option_values(option_id);
```

## 🚀 Cómo Usar el Nuevo Sistema

### Para el Admin

#### 1. Crear un Producto con Variantes

1. **Crear el producto básico** en "Productos"
   - Nombre, descripción, imagen, precio base

2. **Editar el producto** y hacer clic en "Administrar Variantes"

3. **Paso 1: Opciones**
   - Usa la plantilla "Ropa" para crear Talla y Color automáticamente
   - O crea opciones personalizadas (Material, Estilo, etc.)

4. **Paso 2: Valores**
   - Agrega los valores específicos
   - Para colores, puedes usar:
     - Nombres: "Rojo", "Azul", "Negro"
     - Códigos hex: "#ff0000", "#007bff", "#000000"
   - Usa el ícono de ojo para ocultar valores temporalmente

5. **Paso 3: Inventario**
   - Haz clic en "Generar" para crear todas las combinaciones
   - Edita el precio de cada variante (ej: talla L puede costar más)
   - Establece el stock específico de cada combinación
   - Desactiva variantes que no estén disponibles

#### 2. Ver Pedidos con Variantes

En el panel de pedidos, ahora verás:
- **Nombre del producto**
- **Variante seleccionada** en badges azules (ej: Talla: M, Color: Rojo)
- **SKU** si lo configuraste
- **Precio** específico de esa variante
- **Cantidad** pedida

### Para el Cliente (Frontend)

El selector de variantes en la página del producto:
- Muestra solo las opciones activas y visibles
- Valida stock antes de permitir agregar al carrito
- Muestra el precio específico de la variante seleccionada
- Previene seleccionar combinaciones sin stock

## 📋 Migración SQL

**Archivo**: `sql-migrations/mejora-sistema-variantes.sql`

Para ejecutar la migración:

1. Ve al Dashboard de Supabase
2. SQL Editor → New Query
3. Copia y pega el contenido de `mejora-sistema-variantes.sql`
4. Ejecuta la query
5. Verifica que no haya errores

## 🔧 Cambios en el Código

### Componentes Nuevos

1. **`VariantsEditorNew.tsx`** - Editor de variantes completamente rediseñado
   - Reemplaza al antiguo `VariantsEditor.tsx`
   - Interfaz de 3 pasos
   - Plantillas rápidas
   - Guardado automático

### Componentes Modificados

1. **`AdminProducts.tsx`**
   - Importa `VariantsEditorNew` en lugar de `VariantsEditor`
   - Modal más ancho (max-w-6xl) para mejor visualización

2. **`AdminOrders.tsx`**
   - Muestra variantes con badges visuales
   - Soporta colores con círculos
   - Muestra SKU de variante

3. **`lib/supabase.ts`**
   - Tipo `PedidoItem` actualizado con campos de variante

## 🎨 Ejemplos de Uso

### Ejemplo 1: Camiseta con Tallas y Colores

**Opciones**:
- Talla: XS, S, M, L, XL
- Color: Blanco (#ffffff), Negro (#000000), Azul (#007bff)

**Variantes Generadas**: 15 (5 tallas × 3 colores)

**Configuración de Precios**:
- Tallas XS-M: S/ 29.90 (precio base)
- Tallas L-XL: S/ 34.90 (+S/ 5.00)

**Configuración de Stock**:
- M + Blanco: 50 unidades
- L + Negro: 30 unidades
- XL + Azul: 10 unidades (pocas unidades)

### Ejemplo 2: Producto Simple sin Variantes

Si tu producto no tiene variantes (ej: un libro):
- No crees opciones
- El stock y precio se manejan a nivel de producto
- El sistema funciona normalmente sin variantes

## ✅ Checklist de Verificación

Después de migrar, verifica:

- [ ] La migración SQL se ejecutó sin errores
- [ ] Puedes ver la vista `variantes_con_detalles` en el dashboard
- [ ] Las funciones SQL están disponibles
- [ ] El editor de variantes muestra 3 pasos claramente
- [ ] Puedes crear opciones y valores
- [ ] Las plantillas rápidas funcionan
- [ ] Puedes generar variantes automáticamente
- [ ] Los pedidos muestran las variantes seleccionadas
- [ ] El frontend muestra el selector de variantes correctamente

## 🐛 Solución de Problemas

### "No se pueden generar variantes"
- Verifica que hayas creado al menos una opción
- Verifica que cada opción tenga al menos un valor visible
- Revisa la consola del navegador para errores

### "Las variantes no se muestran en pedidos"
- Verifica que el campo `variant_info` exista en la tabla `pedidos`
- Ejecuta la migración SQL si no lo hiciste
- Revisa que el checkout esté guardando la información de variante

### "Error al cargar variantes_con_detalles"
- Ejecuta la migración SQL completa
- Verifica los permisos: `GRANT SELECT ON variantes_con_detalles TO anon, authenticated;`
- Verifica que el producto tenga variantes creadas

## 📚 Documentación Técnica

### Estructura de Tablas

```
product_options
├── id (uuid)
├── product_id (uuid) → productos.id
├── name (text) - ej: "Talla", "Color"
├── position (int) - orden de visualización
└── created_at (timestamptz)

product_option_values
├── id (uuid)
├── option_id (uuid) → product_options.id
├── value (text) - ej: "M", "Rojo", "#ff0000"
├── position (int)
├── metadata (jsonb) - ej: { "hex": "#ff0000" }
├── visible (boolean) - mostrar/ocultar sin eliminar
└── created_at (timestamptz)

product_variants
├── id (uuid)
├── product_id (uuid) → productos.id
├── option_value_ids (uuid[]) - array de IDs seleccionados
├── price (numeric) - precio específico de esta variante
├── stock (int) - stock específico de esta variante
├── is_active (boolean) - activa/inactiva
├── sku (text) - código SKU opcional
├── attributes (jsonb) - metadatos adicionales
└── created_at (timestamptz)
```

### Flujo de Datos

```
1. Admin crea Producto Base
   ↓
2. Admin crea Opciones (Talla, Color)
   ↓
3. Admin agrega Valores (S, M, L / Rojo, Azul)
   ↓
4. Admin genera Variantes (todas las combinaciones)
   ↓
5. Admin configura precio/stock por variante
   ↓
6. Cliente selecciona opciones en el producto
   ↓
7. Frontend encuentra variante matching
   ↓
8. Cliente agrega al carrito con variant_id
   ↓
9. Pedido se crea con variant_info
   ↓
10. Admin ve pedido con variante clara
```

## 🎉 Conclusión

El nuevo sistema de variantes:
- ✅ Es más fácil de usar para el admin
- ✅ Muestra información clara en pedidos
- ✅ Tiene mejor rendimiento con índices SQL
- ✅ Soporta casos complejos (múltiples opciones)
- ✅ Es extensible para futuras mejoras

---

**Última actualización**: Noviembre 2024
**Versión**: 2.0
**Estado**: ✅ Producción
