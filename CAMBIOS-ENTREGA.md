# Cambios Implementados - Sistema de Entrega y DNI

## 📋 Resumen
Se implementó un sistema completo de gestión de información de entrega, incluyendo:
- Campo DNI en el checkout
- Tres métodos de entrega
- Guardado automático de datos de entrega en la base de datos
- Visualización de información de entrega en el panel de administración

## 🎯 Funcionalidades Implementadas

### 1. Campo DNI
- ✅ Validación de 8 dígitos numéricos
- ✅ Auto-guardado en la tabla `usuarios` cuando se completa
- ✅ Visualización en el panel de administración de usuarios
- ✅ Integración con el sistema de perfiles de usuario

### 2. Métodos de Entrega
Se agregaron tres opciones de entrega:

1. **📦 Envío a domicilio (Olva Courier)**
   - Entrega en 3-5 días hábiles
   - Requiere dirección completa
   - Requiere DNI y teléfono

2. **🚇 Pago contra entrega - Tren Línea 1**
   - Entrega en estación del Metro de Lima
   - Requiere especificar estación
   - Requiere DNI y teléfono para coordinación

3. **🏪 Recojo en tienda**
   - Dirección opcional
   - Requiere DNI y teléfono para notificación de pedido listo

### 3. Validación Condicional
- Dirección obligatoria para envío y contra entrega
- Dirección opcional para recojo en tienda
- DNI siempre requerido (8 dígitos)
- Teléfono siempre requerido

### 4. Persistencia de Datos
Los datos de entrega se guardan en la base de datos cuando el pago se completa exitosamente:
- `metodo_entrega`: tipo de entrega seleccionado
- `telefono_contacto`: teléfono del cliente
- `dni_cliente`: DNI del cliente
- `nombre_completo`: nombre completo del cliente
- `notas_entrega`: notas adicionales (opcional)

## 🗄️ Cambios en Base de Datos

### Tabla `usuarios`
```sql
-- Nuevo campo
dni VARCHAR(8)

-- Nuevo índice
idx_usuarios_dni
```

### Tabla `pedidos`
```sql
-- Nuevos campos
metodo_entrega VARCHAR(20) CHECK (metodo_entrega IN ('envio', 'contraentrega', 'tienda'))
telefono_contacto VARCHAR(25)
dni_cliente VARCHAR(8)
nombre_completo VARCHAR(200)
notas_entrega TEXT

-- Nuevos índices
idx_pedidos_metodo_entrega
idx_pedidos_dni_cliente
```

## 📁 Archivos Modificados

### Frontend (React/TypeScript)

1. **src/pages/Checkout.tsx**
   - Agregado campo DNI con validación
   - Agregado selector de método de entrega (3 tarjetas)
   - Validación condicional de dirección según método
   - Auto-guardado de DNI en base de datos
   - Paso de datos de entrega al componente de pago

2. **src/components/Checkout/MercadoPagoCheckout.tsx**
   - Nueva prop `deliveryData` con interfaz tipada
   - Inclusión de datos de entrega en `preferenceData`
   - Datos de entrega en metadata de MercadoPago

3. **src/lib/userProfile.ts**
   - Nueva función `updateUserDNI(userId, dni)`
   - Nueva función `getUserProfile(userId)`
   - Validación de DNI (8 dígitos numéricos)

4. **src/lib/orders.ts**
   - Actualizada interfaz `CreateOrder` con campos de entrega
   - Actualizada interfaz `Order` con campos de entrega

5. **src/components/Admin/AdminUsers.tsx**
   - Nueva columna DNI en tabla de usuarios
   - Mostrar "Sin DNI" si el usuario no tiene DNI registrado

6. **src/components/Admin/AdminOrders.tsx**
   - Nueva sección "Información de Entrega" en modal de detalles
   - Visualización de método de entrega con emojis
   - Visualización de DNI, nombre completo y teléfono
   - Visualización de notas de entrega (si existen)

7. **src/contexts/AuthContext.tsx**
   - Agregado campo `dni?: string` a interfaz `Usuario`

8. **src/lib/supabase.ts**
   - Agregados campos de entrega a interfaz `Pedido`

### Backend (API/Serverless)

1. **api/mercadopago/create-preference.ts**
   - Aceptar parámetros `delivery_data` y `metadata`
   - Incluir datos de entrega en `orderData` codificado en base64
   - Pasar datos a través del `external_reference`

2. **api/mercadopago/webhook.ts**
   - Extraer datos de entrega del `orderData`
   - Guardar campos de entrega al crear pedido
   - Soporte para datos en `delivery_data` y `metadata`

### SQL Migrations

1. **sql-migrations/add-dni-field.sql** (NUEVO)
   - Agrega columna `dni` a tabla `usuarios`
   - Crea índice `idx_usuarios_dni`
   - Agrega comentarios de documentación

2. **sql-migrations/add-pedidos-delivery-fields.sql** (NUEVO)
   - Agrega 5 columnas de entrega a tabla `pedidos`
   - Crea restricción CHECK para `metodo_entrega`
   - Crea índices para búsqueda rápida
   - Agrega comentarios de documentación

## 🔄 Flujo de Datos

```
1. Usuario completa checkout
   ↓
2. Ingresa DNI (auto-guardado en usuarios)
   ↓
3. Selecciona método de entrega
   ↓
4. Ingresa datos según método seleccionado
   ↓
5. Datos se pasan a MercadoPagoCheckout
   ↓
6. Se crea preferencia con delivery_data
   ↓
7. Usuario completa pago
   ↓
8. Webhook recibe confirmación
   ↓
9. Se crea pedido con todos los datos de entrega
   ↓
10. Admin visualiza datos en panel
```

## ✅ Validaciones Implementadas

### Campo DNI
- Solo números permitidos
- Exactamente 8 dígitos
- Validación en frontend y backend

### Campo Dirección
- Obligatoria para "envío" y "contraentrega"
- Opcional para "recojo en tienda"
- Placeholder dinámico según método

### Antes de Pagar
- Nombre completo ✓
- DNI completo (8 dígitos) ✓
- Teléfono ✓
- Dirección (condicional) ✓
- Términos aceptados ✓

## 🎨 UI/UX

### Checkout
- 3 tarjetas visuales para métodos de entrega
- Iconos descriptivos (📦, 🚇, 🏪)
- Colores condicionales (amarillo cuando seleccionado)
- Descripciones claras de cada método
- Validación en tiempo real

### Admin Panel
- Nueva sección "Información de Entrega"
- Grid de 2 columnas para datos
- Emojis para identificar método visualmente
- Campos opcionales solo se muestran si tienen datos
- Separador visual entre secciones

## 🔐 Seguridad

- Validación de DNI en cliente y servidor
- Índices en base de datos para búsquedas eficientes
- Tipos TypeScript estrictos
- Validación de datos antes de insertar en DB
- RLS policies de Supabase aplican

## 📊 Impacto en Performance

- **Nuevos índices**: Mejoran búsquedas por DNI y método de entrega
- **Campos opcionales**: No impactan pedidos existentes
- **Auto-guardado DNI**: 1 query adicional al completar DNI
- **Payload size**: +200 bytes aprox por preferencia de pago

## 🚀 Próximos Pasos

### Para Producción
1. **Ejecutar migraciones SQL en Supabase**
   ```bash
   # Conectarse a Supabase SQL Editor
   # Ejecutar: sql-migrations/add-dni-field.sql
   # Ejecutar: sql-migrations/add-pedidos-delivery-fields.sql
   ```

2. **Verificar permisos RLS**
   - Verificar que usuarios puedan actualizar su propio DNI
   - Verificar que pedidos se creen correctamente

3. **Testing**
   - Probar checkout completo con cada método de entrega
   - Verificar que datos se guarden correctamente
   - Verificar visualización en admin panel
   - Probar con y sin DNI pre-guardado

### Mejoras Futuras (Opcionales)
- [ ] Campo de notas de entrega editable por el cliente
- [ ] Validación de estaciones del Metro (dropdown)
- [ ] Mapa para dirección de envío
- [ ] Historial de direcciones frecuentes
- [ ] Notificaciones por SMS al teléfono registrado
- [ ] Tracking de estado de entrega
- [ ] Exportar pedidos a Excel con datos de entrega

## 📝 Notas Técnicas

### TypeScript
- Todos los tipos actualizados
- No hay errores de compilación
- Autocompletado funciona correctamente

### Base de Datos
- Todas las columnas nuevas son opcionales (nullable)
- Compatibilidad con pedidos antiguos
- Índices optimizados para consultas frecuentes

### APIs
- Backward compatible (pedidos sin delivery_data funcionan)
- Webhook maneja ambos formatos (con y sin delivery_data)
- Metadata como fallback si delivery_data falta

## 🐛 Consideraciones y Edge Cases

1. **Pedidos anteriores**: Funcionan sin problemas (campos opcionales)
2. **DNI duplicado**: Permitido (no hay constraint UNIQUE)
3. **Cambio de método después de DNI guardado**: DNI se mantiene
4. **Fallo en guardado de DNI**: No bloquea checkout
5. **Datos de entrega faltantes**: Webhook usa metadata como fallback

---

**Fecha de implementación**: 2024
**Autor**: Sistema de desarrollo
**Versión**: 1.0.0
