# 📧 Sistema de Emails Transaccionales

Sistema completo de notificaciones por email usando Resend para mantener informados a los clientes sobre el estado de sus pedidos y darles la bienvenida a la plataforma.

---

## 📋 Índice

1. [Características](#-características)
2. [Configuración](#-configuración)
3. [Tipos de Emails](#-tipos-de-emails)
4. [Flujo de Trabajo](#-flujo-de-trabajo)
5. [Archivos del Sistema](#-archivos-del-sistema)
6. [Uso](#-uso)
7. [Testing](#-testing)
8. [Troubleshooting](#-troubleshooting)

---

## ✨ Características

- ✅ **4 tipos de emails transaccionales**
- ✅ **Plantillas HTML responsive** con estilos inline
- ✅ **Integración con MercadoPago** (confirmación automática)
- ✅ **Panel de administración** (botones de envío/entrega)
- ✅ **Email de bienvenida** para nuevos usuarios
- ✅ **Tracking de pedidos** con timestamps en base de datos
- ✅ **Manejo de errores** robusto (no falla el flujo principal)
- ✅ **100% TypeScript** con tipos estrictos

---

## ⚙️ Configuración

### 1. Crear cuenta en Resend

1. Visita [resend.com](https://resend.com)
2. Crea una cuenta (plan gratuito: 100 emails/día)
3. Verifica tu dominio o usa `onboarding@resend.dev` para testing
4. Genera una API Key desde el dashboard

### 2. Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Resend API
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Configuración de Email
VITE_EMAIL_FROM=noreply@tumercadillo.com
VITE_EMAIL_FROM_NAME=Mercadillo

# URL de la aplicación (para links en emails)
VITE_APP_URL=https://tumercadillo.com
```

### 3. Migración de Base de Datos

Ejecuta la migración SQL en Supabase:

```sql
-- Ejecutar: migration-add-order-tracking.sql
```

Esto añade los siguientes campos a la tabla `pedidos`:

- `estado` (VARCHAR): pendiente | confirmado | enviado | entregado | cancelado
- `fecha_confirmacion` (TIMESTAMP)
- `fecha_envio` (TIMESTAMP)
- `fecha_entrega` (TIMESTAMP)
- `numero_seguimiento` (VARCHAR)

---

## 📨 Tipos de Emails

### 1. ✅ Confirmación de Pedido

**Cuándo se envía:** Automáticamente después de un pago exitoso en MercadoPago

**Contenido:**
- Mensaje de agradecimiento
- Número de pedido
- Resumen de productos
- Subtotal, descuento (si aplica), total
- Dirección de envío
- Próximos pasos
- Botón "Ver mi pedido"

**Archivo:** `src/templates/emails/OrderConfirmation.tsx`

**Función:** `enviarEmailConfirmacionPedido()`

---

### 2. 📦 Notificación de Envío

**Cuándo se envía:** Cuando el admin marca el pedido como "Enviado"

**Contenido:**
- Confirmación de envío
- Número de pedido
- Fecha de envío
- Número de seguimiento (opcional)
- Lista de productos
- Timeline del proceso de entrega
- Estimado de entrega (2-5 días)

**Archivo:** `src/templates/emails/ShippingNotification.tsx`

**Función:** `enviarEmailEnvio()`

---

### 3. 🎉 Confirmación de Entrega

**Cuándo se envía:** Cuando el admin marca el pedido como "Entregado"

**Contenido:**
- Celebración de entrega exitosa
- Número de pedido
- Fecha de entrega
- Lista de productos
- Solicitud de reseña
- Información de soporte (48h para reportar problemas)

**Archivo:** `src/templates/emails/DeliveryConfirmation.tsx`

**Función:** `enviarEmailEntrega()`

---

### 4. 👋 Email de Bienvenida

**Cuándo se envía:** Al crear un perfil nuevo de usuario

**Contenido:**
- Mensaje de bienvenida personalizado
- Características de la plataforma
- Cupón de bienvenida (BIENVENIDA10)
- Tips para aprovechar la cuenta
- Información de soporte
- Links a redes sociales

**Archivo:** `src/templates/emails/Welcome.tsx`

**Función:** `enviarEmailBienvenida()`

---

## 🔄 Flujo de Trabajo

### Confirmación de Pedido

```
Usuario paga → MercadoPago webhook → 
Crear pedido en BD → 
Enviar email de confirmación → 
Usuario recibe email
```

**Código:**
```typescript
// api/mercadopago/webhook.ts
if (paymentInfo.status === 'approved' && order) {
  const { data: userData } = await supabase
    .from('usuarios')
    .select('email, nombre_completo')
    .eq('usuario_id', order.usuario_id)
    .single()

  await enviarEmailConfirmacionPedido({
    email: userData.email,
    nombre: userData.nombre_completo,
    pedido: { ... },
    items: [ ... ],
    direccion: { ... }
  })
}
```

---

### Notificación de Envío

```
Admin abre pedido → 
Clic en "Marcar como Enviado" → 
Actualizar BD (estado, fecha_envio) → 
Enviar email → 
Usuario recibe notificación
```

**Código:**
```typescript
// src/components/Admin/AdminOrders.tsx
const handleMarcarComoEnviado = async (pedido) => {
  await supabaseAdmin
    .from('pedidos')
    .update({ 
      estado: 'enviado',
      fecha_envio: new Date().toISOString()
    })
    .eq('id', pedido.id)

  await enviarEmailEnvio({
    email: userData.email,
    nombre: userData.nombre_completo,
    numero_pedido: pedido.id,
    fecha_envio: new Date().toISOString(),
    items: [ ... ]
  })
}
```

---

### Confirmación de Entrega

```
Admin abre pedido → 
Clic en "Marcar como Entregado" → 
Actualizar BD (estado, fecha_entrega) → 
Enviar email → 
Usuario recibe confirmación + solicitud de reseña
```

**Código:**
```typescript
// src/components/Admin/AdminOrders.tsx
const handleMarcarComoEntregado = async (pedido) => {
  await supabaseAdmin
    .from('pedidos')
    .update({ 
      estado: 'entregado',
      fecha_entrega: new Date().toISOString()
    })
    .eq('id', pedido.id)

  await enviarEmailEntrega({
    email: userData.email,
    nombre: userData.nombre_completo,
    numero_pedido: pedido.id,
    fecha_entrega: new Date().toISOString(),
    items: [ ... ]
  })
}
```

---

### Email de Bienvenida

```
Usuario se registra → 
Crear perfil en BD → 
Enviar email de bienvenida → 
Usuario recibe cupón BIENVENIDA10
```

**Código:**
```typescript
// src/lib/userProfile.ts
export async function createUserProfile(userId, userData) {
  await supabase
    .from('usuarios')
    .insert([{ usuario_id: userId, ...userData }])

  await enviarEmailBienvenida({
    email: userData.email,
    nombre: userData.nombre_completo
  })
}
```

---

## 📁 Archivos del Sistema

### Librería Principal
```
src/lib/emails.ts
├── Resend client initialization
├── enviarEmailConfirmacionPedido()
├── enviarEmailEnvio()
├── enviarEmailEntrega()
└── enviarEmailBienvenida()
```

### Plantillas HTML
```
src/templates/emails/
├── OrderConfirmation.tsx      (Confirmación de pedido)
├── ShippingNotification.tsx   (Notificación de envío)
├── DeliveryConfirmation.tsx   (Confirmación de entrega)
├── Welcome.tsx                (Email de bienvenida)
└── index.ts                   (Exports)
```

### Integraciones
```
api/mercadopago/webhook.ts     (Email automático después del pago)
src/components/Admin/AdminOrders.tsx  (Botones de envío/entrega)
src/lib/userProfile.ts         (Email al crear perfil)
```

### Migraciones
```
migration-add-order-tracking.sql  (Campos de tracking)
```

---

## 🚀 Uso

### Enviar Email de Confirmación (Automático)

Se envía automáticamente en el webhook de MercadoPago. No requiere acción manual.

---

### Enviar Email de Envío (Admin)

1. Ir a `/admin/pedidos`
2. Abrir el pedido haciendo clic en el ícono de ojo
3. Hacer clic en **"Marcar como Enviado"** (botón morado)
4. ✅ El estado se actualiza y el email se envía automáticamente

---

### Enviar Email de Entrega (Admin)

1. Ir a `/admin/pedidos`
2. Abrir el pedido
3. Hacer clic en **"Marcar como Entregado"** (botón verde)
4. ✅ El estado se actualiza y el email se envía automáticamente

---

### Enviar Email de Bienvenida (Programático)

```typescript
import { createUserProfile } from '@/lib/userProfile'

// Después del registro exitoso
await createUserProfile(userId, {
  email: 'usuario@ejemplo.com',
  nombre_completo: 'Juan Pérez',
  telefono: '+51 999 999 999'
})
```

---

## 🧪 Testing

### Modo de Testing (Resend)

Por defecto, Resend permite enviar emails de prueba sin dominio verificado usando:

```env
VITE_EMAIL_FROM=onboarding@resend.dev
```

**Límites en testing:**
- Solo puedes enviar a tu propio email (el de la cuenta Resend)
- 100 emails/día

### Testing Manual

1. **Confirmación de Pedido:**
   - Hacer una compra de prueba con MercadoPago
   - Verificar que llegue el email después del pago

2. **Notificación de Envío:**
   - Ir a `/admin/pedidos`
   - Marcar un pedido como enviado
   - Verificar email en la bandeja de entrada

3. **Confirmación de Entrega:**
   - Marcar un pedido como entregado
   - Verificar email con solicitud de reseña

4. **Email de Bienvenida:**
   - Crear un usuario nuevo
   - Llamar `createUserProfile()`
   - Verificar email de bienvenida

---

## 🔧 Troubleshooting

### ❌ "Email no se envía"

**Posibles causas:**

1. **API Key incorrecta**
   - Verifica `VITE_RESEND_API_KEY` en `.env.local`
   - Regenera la key en Resend dashboard si es necesario

2. **Dominio no verificado**
   - Usa `onboarding@resend.dev` para testing
   - O verifica tu dominio en Resend

3. **Límite de emails alcanzado**
   - Plan gratuito: 100 emails/día
   - Verifica tu uso en Resend dashboard

**Solución:**
```typescript
// Revisar logs en consola del servidor
console.log('✅ Email enviado:', emailData?.id)
console.error('❌ Error enviando email:', error)
```

---

### ❌ "Usuario no recibe email"

**Posibles causas:**

1. **Email en spam**
   - Revisar carpeta de spam
   - Agregar `noreply@tumercadillo.com` a contactos

2. **Email incorrecto en BD**
   - Verificar tabla `usuarios`
   - Confirmar campo `email` correcto

3. **Proveedor bloquea emails**
   - Algunos proveedores bloquean emails transaccionales
   - Probar con otro email (Gmail, Outlook)

**Solución:**
```sql
-- Verificar email del usuario
SELECT email, nombre_completo 
FROM usuarios 
WHERE usuario_id = 'user_xxx';
```

---

### ❌ "Error al parsear dirección en email"

**Posible causa:** La dirección viene como string JSON pero no se parsea correctamente

**Solución implementada:**
```typescript
let direccionParsed: any
try {
  direccionParsed = typeof order.direccion_envio === 'string' 
    ? JSON.parse(order.direccion_envio)
    : order.direccion_envio
} catch {
  direccionParsed = {
    nombre_completo: userData.nombre_completo,
    direccion: order.direccion_envio,
    // ... valores por defecto
  }
}
```

---

### ❌ "Botones no aparecen en AdminOrders"

**Verifica:**

1. Ejecutaste la migración SQL
2. Los imports están correctos
3. No hay errores de TypeScript

**Solución:**
```bash
# Verificar errores
npm run build

# O en desarrollo
npm run dev
```

---

## 📊 Estadísticas de Uso

### Ver emails enviados

1. Ir a [Resend Dashboard](https://resend.com/emails)
2. Ver lista de emails enviados
3. Revisar tasas de entrega
4. Ver detalles de cada email

---

## 🎨 Personalización

### Cambiar colores de emails

Edita las plantillas en `src/templates/emails/`:

```tsx
// Ejemplo: OrderConfirmation.tsx
.header { 
  background: linear-gradient(135deg, #c9a961 0%, #a68943 100%); 
  // ☝️ Cambia estos colores
}
```

### Añadir logo

```tsx
<div className="header">
  <img 
    src="https://tumercadillo.com/logo.png" 
    alt="Logo"
    style={{ width: '150px', marginBottom: '20px' }}
  />
  <h1>¡Gracias por tu compra! 🎉</h1>
</div>
```

---

## 🔐 Seguridad

- ✅ API Keys en variables de entorno (nunca en código)
- ✅ Validación de emails antes de enviar
- ✅ Manejo de errores sin exponer información sensible
- ✅ Logs detallados solo en servidor
- ✅ Rate limiting de Resend (100/día gratis)

---

## 📈 Próximos Pasos Opcionales

- [ ] Email de carrito abandonado (requiere sistema de carritos guardados)
- [ ] Email de cambio de contraseña
- [ ] Email de confirmación de cancelación
- [ ] Email de reembolso procesado
- [ ] Newsletter / Promociones
- [ ] Email de cumpleaños con cupón especial

---

## ✅ Checklist de Implementación

- [x] Instalación de Resend (`pnpm add resend`)
- [x] Variables de entorno configuradas
- [x] Migración SQL ejecutada
- [x] Librería `emails.ts` creada
- [x] 4 plantillas de email creadas
- [x] Integración en webhook de MercadoPago
- [x] Botones en AdminOrders
- [x] Función `createUserProfile` con email
- [x] Documentación completa
- [ ] Testing en producción
- [ ] Dominio verificado en Resend

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección de Troubleshooting
2. Verifica logs en consola del servidor
3. Revisa Resend Dashboard para ver si los emails fueron enviados
4. Verifica que las variables de entorno estén configuradas

---

**Sistema implementado el:** 4 de octubre, 2025  
**Versión:** 1.0.0  
**Stack:** Resend + React + TypeScript + Supabase + MercadoPago
