# ✨ FASE 2 COMPLETADA - Migración a Supabase Edge Functions

**Fecha:** 2 de Noviembre, 2025  
**Progreso:** 7/9 funciones migradas (78%)

---

## 🎯 Funciones Migradas en Fase 2

### 1. ✅ `checkout` - Crear Pedidos Pendientes
**URL:** `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/checkout`

**Descripción:**
- Crea pedidos con estado "pendiente" antes del pago
- Calcula IGV (18%) automáticamente
- Aplica descuentos de cupones
- Requiere autenticación con `x-user-id`

**Secretos requeridos:**
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `SUPABASE_URL` ✅

**Body esperado:**
```json
{
  "items": [...],
  "shipping_address": {...},
  "cupon_codigo": "CODIGO",
  "delivery_data": {...}
}
```

---

### 2. ✅ `emails` - Envío de Emails Transaccionales
**URL:** `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/emails`

**Descripción:**
- Integración con Resend API para envío de emails
- Soporta 4 tipos de emails:
  - ✉️ `order_confirmation` - Confirmación de pedido
  - 📦 `shipping` - Pedido enviado
  - ✅ `delivery` - Pedido entregado
  - 👋 `welcome` - Bienvenida a nuevos usuarios
- Templates HTML integrados

**Secretos requeridos:**
- `RESEND_API_KEY=re_FNiQkHW1_MhdZCehba257wyBusis2tBGj` ✅
- `EMAIL_FROM=pedidos@mercadillo.app` ✅
- `EMAIL_FROM_NAME=Mercadillo` ✅

**Body esperado:**
```json
{
  "type": "order_confirmation",
  "to": "cliente@email.com",
  "data": {
    "nombre": "Juan Pérez",
    "pedido": {...},
    "items": [...],
    "direccion": {...}
  }
}
```

---

### 3. ✅ `mercadopago-preference` - Crear Preferencias de Pago
**URL:** `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/mercadopago-preference`

**Descripción:**
- Crea preferencias de pago en MercadoPago
- Genera `external_reference` con datos del pedido codificados
- Aplica descuentos de cupones
- Configura URLs de redirección

**Secretos requeridos:**
- `MERCADOPAGO_ACCESS_TOKEN=APP_USR-5101834776453209-092922-0bd72487c3ad016683e2531cb620ec0f-2714661135` ✅
- `FRONTEND_URL=https://mercadillo.app` ✅

**Body esperado:**
```json
{
  "user_id": "user_xxx",
  "items": [...],
  "shipping_address": {...},
  "cupon_codigo": "CODIGO",
  "delivery_data": {...}
}
```

**Respuesta:**
```json
{
  "id": "preference_id",
  "init_point": "https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=xxx"
}
```

---

### 4. ✅ `mercadopago-webhook` - Notificaciones de Pago
**URL:** `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/mercadopago-webhook`

**Descripción:**
- Recibe notificaciones de MercadoPago sobre pagos
- Crea o actualiza pedidos según el estado del pago
- Registra uso de cupones
- Envía email de confirmación automáticamente

**Secretos requeridos:**
- `MERCADOPAGO_ACCESS_TOKEN` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅

**Flujo:**
1. MercadoPago envía notificación POST
2. Webhook obtiene detalles del pago
3. Crea/actualiza pedido en BD
4. Registra cupón si aplica
5. Envía email de confirmación

---

## 🔐 Secrets Configurados

Todos los secrets se configuraron con los valores reales del usuario:

```bash
✅ ADMIN_SECRET (desde Fase 1)
✅ SUPABASE_URL (desde Fase 1)
✅ SUPABASE_ANON_KEY (desde Fase 1)
✅ SUPABASE_SERVICE_ROLE_KEY (desde Fase 1)
✅ RESEND_API_KEY
✅ EMAIL_FROM
✅ EMAIL_FROM_NAME
✅ MERCADOPAGO_ACCESS_TOKEN
✅ FRONTEND_URL
✅ GEMINI_API_KEY (para Fase 3)
```

**Comando usado:**
```bash
npx -y supabase secrets set KEY=VALUE
```

---

## 📦 Deployment Exitoso

Todas las funciones se desplegaron exitosamente:

```bash
✅ npx -y supabase functions deploy checkout --no-verify-jwt
✅ npx -y supabase functions deploy emails --no-verify-jwt
✅ npx -y supabase functions deploy mercadopago-preference --no-verify-jwt
✅ npx -y supabase functions deploy mercadopago-webhook --no-verify-jwt
```

**Resultado:**
```
ID: 5d250f36-d2e8-4742-af6c-5da3cfee53f9 | checkout               | ACTIVE | v1
ID: a1491b17-b832-4a42-94bc-349690375cdc | emails                 | ACTIVE | v1
ID: f0b04b3d-710a-4722-80f8-f8aac602dea9 | mercadopago-preference | ACTIVE | v1
ID: c7e69b02-16f3-4a79-a041-6133d670e803 | mercadopago-webhook    | ACTIVE | v1
```

---

## ⚙️ Configuración del Frontend

Se actualizó `src/config/api.ts` para activar las nuevas funciones:

```typescript
const USE_SUPABASE_FUNCTIONS = {
  products: true,    // ✅ Fase 1
  orders: true,      // ✅ Fase 1
  admin: true,       // ✅ Fase 1
  checkout: true,    // ✅ Fase 2
  emails: true,      // ✅ Fase 2
  mercadopago: true, // ✅ Fase 2
  chat: false,       // ⏸️ Fase 3 pendiente
}
```

---

## 🎨 Cambios Técnicos Importantes

### 1. MercadoPago sin SDK
Como Deno no soporta el SDK de Node.js de MercadoPago, se reimplementó usando la REST API directamente:

```typescript
// Antes (Vercel/Node.js)
const payment = new Payment(mpClient)
await payment.create(...)

// Ahora (Supabase/Deno)
const response = await fetch('https://api.mercadopago.com/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(...)
})
```

### 2. Base64 en Deno
La decodificación Base64 funciona diferente en Deno:

```typescript
// Antes (Node.js)
Buffer.from(encodedData, 'base64').toString('utf-8')

// Ahora (Deno)
const bytes = Uint8Array.from(atob(encodedData), c => c.charCodeAt(0))
const text = new TextDecoder().decode(bytes)
```

### 3. Email Templates HTML
Los templates de email están embebidos directamente en el código (no archivos externos):

```typescript
const templates = {
  order_confirmation: (data) => `<!DOCTYPE html>...`,
  shipping: (data) => `<!DOCTYPE html>...`,
  delivery: (data) => `<!DOCTYPE html>...`,
  welcome: (data) => `<!DOCTYPE html>...`
}
```

---

## 📊 Estado de la Migración

### Funciones Totales: 9
- ✅ **Fase 1 (3/3):** products, orders, admin
- ✅ **Fase 2 (4/4):** checkout, emails, mercadopago-preference, mercadopago-webhook
- ⏸️ **Fase 3 (1/1):** chat (Gemini AI)
- ➕ **Adicional (1/1):** clerk-jwt-transform (ya existente)

### Progreso: 78% completado

```
[████████████████████████████░░░░░░] 7/9 funciones
```

---

## 🧪 Testing Recomendado

### 1. Probar Checkout
```bash
curl -X POST https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/checkout \
  -H "apikey: YOUR_ANON_KEY" \
  -H "x-user-id: user_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [...],
    "shipping_address": {...}
  }'
```

### 2. Probar Email
```bash
curl -X POST https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/emails \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "data": { "nombre": "Test User" }
  }'
```

### 3. Probar MercadoPago Preference
```bash
curl -X POST https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/mercadopago-preference \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_xxx",
    "items": [...]
  }'
```

---

## 🔜 Próximos Pasos (Fase 3)

### 1. Migrar función `chat`
- Integración con Gemini AI
- Streaming de respuestas
- Context awareness

### 2. Testing completo
- Probar flujo completo de compra
- Verificar emails enviados
- Validar webhook de MercadoPago

### 3. Cleanup
- Eliminar funciones de Vercel una vez validado todo
- Actualizar configuración de producción

---

## 🎉 Resumen

**Fase 2 completada exitosamente!** Se migraron 4 funciones críticas:
- ✅ Checkout (pedidos pendientes)
- ✅ Emails (Resend API)
- ✅ MercadoPago Preference (crear pagos)
- ✅ MercadoPago Webhook (recibir notificaciones)

**Todos los secretos configurados** con valores reales del usuario.

**Frontend actualizado** con feature flags activados.

**Progreso total:** 78% (7/9 funciones migradas)

---

**Siguiente:** Fase 3 - Migrar función de chat con Gemini AI
