# 🚀 Migración a Supabase Edge Functions

## 📋 Estado de la Migración

### ✅ Fase 1 - COMPLETADA (3 funciones migradas)

| Función Original (Vercel) | Nueva Edge Function | Estado | URL Nueva |
|---------------------------|---------------------|--------|-----------|
| `/api/products/[id].ts` | `supabase/functions/products` | ✅ Migrada | `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/{id}` |
| `/api/orders.ts` | `supabase/functions/orders` | ✅ Migrada | `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/orders` |
| `/api/admin/index.ts` | `supabase/functions/admin` | ✅ Mejorada | `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/admin?action=...` |

### 🔄 Fase 2 - Pendiente (2 funciones)

| Función Original | Edge Function | Prioridad |
|------------------|---------------|-----------|
| `/api/checkout.ts` | `supabase/functions/checkout` | Alta |
| `/api/emails/send.ts` | `supabase/functions/emails` | Media |

### 🔄 Fase 3 - Pendiente (3 funciones complejas)

| Función Original | Edge Function | Prioridad | Notas |
|------------------|---------------|-----------|-------|
| `/api/mercadopago/create-preference.ts` | `supabase/functions/mercadopago-preference` | Alta | Requiere MercadoPago SDK |
| `/api/mercadopago/webhook.ts` | `supabase/functions/mercadopago-webhook` | Alta | Crítico para pagos |
| `/api/chat.ts` | `supabase/functions/chat` | Media | Requiere Gemini API |

### ⏸️ Fase 4 - Mantener en Vercel

| Función | Razón |
|---------|-------|
| `/api/clerk.ts` | Webhook de autenticación - mejor dejar en Vercel |

---

## 🎯 Beneficios Obtenidos

- ✅ **Liberadas 3 funciones** del límite de Vercel (12 → 9)
- ✅ **CORS configurado** automáticamente en todas las funciones
- ✅ **Mejor rendimiento** (edge execution)
- ✅ **Sin límite** de funciones en Supabase
- ✅ **Integración directa** con la base de datos

---

## 📦 Cómo Desplegar las Edge Functions

### 1. Instalar Supabase CLI

```powershell
# Usando npm
npm install -g supabase

# O usando Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Login en Supabase

```powershell
supabase login
```

### 3. Link al proyecto

```powershell
supabase link --project-ref xwubnuokmfghtyyfpgtl
```

### 4. Configurar Variables de Entorno

En el dashboard de Supabase (Settings > Edge Functions > Secrets), agregar:

```bash
ADMIN_SECRET=tu_secreto_admin_aqui
GEMINI_API_KEY=tu_api_key_de_gemini  # Para cuando migremos chat
RESEND_API_KEY=tu_api_key_de_resend  # Para emails
MERCADOPAGO_ACCESS_TOKEN=tu_token_mp # Para pagos
```

### 5. Desplegar Funciones

```powershell
# Desplegar todas las funciones
supabase functions deploy

# O desplegar una función específica
supabase functions deploy products
supabase functions deploy orders
supabase functions deploy admin
```

---

## 🔧 Actualizar el Frontend

### Antes (Vercel):
```typescript
// src/config/api.ts
const API_BASE = '/api'
```

### Después (Supabase):
```typescript
// src/config/api.ts
const SUPABASE_FUNCTIONS_URL = 'https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1'

export const API_ENDPOINTS = {
  // Edge Functions (Supabase)
  products: (id: string) => `${SUPABASE_FUNCTIONS_URL}/products/${id}`,
  orders: `${SUPABASE_FUNCTIONS_URL}/orders`,
  admin: (action: string) => `${SUPABASE_FUNCTIONS_URL}/admin?action=${action}`,
  
  // Aún en Vercel (hasta migrar)
  checkout: '/api/checkout',
  mercadopago: '/api/mercadopago',
  chat: '/api/chat',
  emails: '/api/emails/send',
  clerk: '/api/clerk'
}
```

---

## 🧪 Probar Localmente

```powershell
# Iniciar todas las funciones localmente
supabase functions serve

# O iniciar una función específica
supabase functions serve products --env-file ./supabase/.env.local
```

Luego probar en: `http://localhost:54321/functions/v1/products/{id}`

---

## 📝 Ejemplo de Uso desde el Frontend

### GET Producto
```typescript
const response = await fetch(
  `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/${productId}`,
  {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  }
)
const data = await response.json()
```

### GET/POST Pedidos
```typescript
// GET pedidos del usuario
const response = await fetch(
  'https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/orders',
  {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'x-user-id': userId
    }
  }
)

// POST crear pedido
const response = await fetch(
  'https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/orders',
  {
    method: 'POST',
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'x-user-id': userId
    },
    body: JSON.stringify({ items, total, ... })
  }
)
```

### Admin Functions
```typescript
// Requiere x-admin-secret header
const response = await fetch(
  'https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/admin?action=stats',
  {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET
    }
  }
)
```

---

## ⚠️ Importante

### Headers Requeridos
Todas las funciones requieren el header `apikey` con tu `SUPABASE_ANON_KEY`:

```typescript
headers: {
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
}
```

### Funciones Admin
Las funciones admin requieren además:

```typescript
headers: {
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET
}
```

---

## 🗑️ Limpieza Post-Migración

Una vez que verifiques que las funciones funcionan en producción:

1. ✅ **Probar** las nuevas URLs en staging/dev
2. ✅ **Actualizar** el frontend para usar las nuevas URLs
3. ✅ **Desplegar** a producción
4. ✅ **Verificar** que todo funciona
5. ⚠️ **Eliminar** los archivos de Vercel:
   ```powershell
   # Solo cuando esté TODO verificado
   rm api/products/[id].ts
   rm api/orders.ts
   # admin/index.ts puede quedar como respaldo por ahora
   ```

---

## 🆘 Troubleshooting

### Error: "Missing apikey"
Asegúrate de incluir el header `apikey` en todas las peticiones.

### Error: "Forbidden" en admin
Verifica que el header `x-admin-secret` sea correcto.

### Error: CORS
Las funciones ya tienen CORS configurado. Si hay problemas, verifica que el origin esté en la lista blanca.

### Función no responde
Verifica los logs en el dashboard de Supabase:
`Settings > Edge Functions > [nombre-funcion] > Logs`

---

## 📊 Próximos Pasos

1. **Probar las 3 funciones migradas** en local
2. **Desplegar a Supabase** 
3. **Actualizar el frontend** para usar las nuevas URLs
4. **Verificar en producción**
5. **Continuar con Fase 2** (checkout + emails)

---

## 💡 Notas Adicionales

- Las Edge Functions de Supabase corren en **Deno**, no Node.js
- Usan **imports de URLs** en lugar de `node_modules`
- Son **mucho más rápidas** que las serverless de Vercel
- **No hay límite** de funciones en Supabase
- El **plan gratuito** incluye 500K invocaciones/mes

---

**Última actualización:** 1 de Noviembre, 2025
**Funciones migradas:** 3/12
**Progreso:** 25% ✅
