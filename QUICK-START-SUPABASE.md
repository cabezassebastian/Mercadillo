# ⚡ Quick Start - Supabase Edge Functions

## 🎯 Resumen de la Migración Fase 1

✅ **3 funciones migradas de Vercel a Supabase**
- `products` - Detalles de productos
- `orders` - Gestión de pedidos  
- `admin` - Panel administrativo

🎉 **Liberaste 3 espacios en Vercel** (ahora tienes 9/12 en lugar de 12/12)

---

## ⚡ Comandos Rápidos

### 📦 Instalación (solo una vez)

```powershell
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
npm run supabase:login

# 3. Link al proyecto
npm run supabase:link
```

### 🔐 Configurar Secrets (solo una vez)

```powershell
# En el dashboard de Supabase: Settings > Edge Functions > Secrets
# O con CLI:
supabase secrets set ADMIN_SECRET=mercadillo_admin_2025_secret_key
```

### 🚀 Deployment

```powershell
# Opción 1: Con script automatizado (RECOMENDADO)
npm run supabase:deploy

# Opción 2: Manual
supabase functions deploy
```

### 🧪 Testing Local

```powershell
# Opción 1: Con script automatizado
npm run supabase:local

# Opción 2: Manual
supabase functions serve
```

---

## 📍 URLs de Producción

Una vez desplegadas, tus funciones estarán en:

```
https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/{id}
https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/orders
https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/admin?action=stats
```

---

## 🔧 Integración con el Frontend

### Opción 1: Usar el archivo de configuración (RECOMENDADO)

```typescript
// Ya está listo en src/config/api.ts
import { API_ENDPOINTS, fetchAPI } from '@/config/api'

// GET producto
const product = await fetchAPI(API_ENDPOINTS.product('123'))

// GET pedidos
const orders = await fetchAPI(API_ENDPOINTS.orders, { userId: 'user_123' })

// POST crear pedido
const newOrder = await fetchAPI(API_ENDPOINTS.orders, {
  method: 'POST',
  userId: 'user_123',
  body: JSON.stringify({ items, total, ... })
})
```

### Opción 2: Fetch directo

```typescript
const response = await fetch(
  'https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/123',
  {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  }
)
const data = await response.json()
```

---

## 🎛️ Feature Flags

En `src/config/api.ts` puedes activar/desactivar funciones migradas:

```typescript
const USE_SUPABASE_FUNCTIONS = {
  products: true,    // ✅ Usando Supabase
  orders: true,      // ✅ Usando Supabase
  admin: true,       // ✅ Usando Supabase
  checkout: false,   // ⏸️ Aún en Vercel
  // ...
}
```

---

## 📊 Próximos Pasos

### 1️⃣ Desplegar a Supabase (5 minutos)
```powershell
npm run supabase:deploy
```

### 2️⃣ Probar en Local (opcional)
```powershell
npm run supabase:local
# Luego probar: http://localhost:54321/functions/v1/products/1
```

### 3️⃣ Verificar en Producción
```powershell
# Probar con cURL
curl https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/1 `
  -H "apikey: $env:VITE_SUPABASE_ANON_KEY"
```

### 4️⃣ El frontend ya está configurado
Las funciones ya están apuntando a Supabase gracias a `src/config/api.ts`

### 5️⃣ Eliminar archivos de Vercel (cuando esté todo OK)
```powershell
# SOLO cuando hayas verificado que TODO funciona
rm api/products/[id].ts
rm api/orders.ts
# api/admin/index.ts puede quedar como backup
```

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| `supabase: command not found` | Instalar con `npm install -g supabase` |
| Error al desplegar | Verificar que estés logueado: `supabase login` |
| 403 Forbidden en admin | Configurar `ADMIN_SECRET` en Supabase |
| 401 Unauthorized | Incluir header `x-user-id` en la petición |

---

## 📚 Documentación Completa

- **Migración completa:** [`MIGRACION-SUPABASE-EDGE-FUNCTIONS.md`](./MIGRACION-SUPABASE-EDGE-FUNCTIONS.md)
- **Setup de secrets:** [`supabase/SETUP-SECRETS.md`](./supabase/SETUP-SECRETS.md)
- **Testing:** [`supabase/TESTING.md`](./supabase/TESTING.md)
- **README funciones:** [`supabase/functions/README.md`](./supabase/functions/README.md)

---

## 💡 Beneficios de la Migración

✅ Sin límite de 12 funciones  
✅ Más rápido (edge execution)  
✅ Gratis hasta 500K invocaciones/mes  
✅ Mejor integración con Supabase  
✅ CORS automático  
✅ Logs en tiempo real

---

## 🎉 ¡Ya está todo listo!

Solo necesitas:
1. ✅ Instalar Supabase CLI
2. ✅ Hacer login
3. ✅ Desplegar con `npm run supabase:deploy`
4. ✅ ¡Listo!

**Tu frontend ya está configurado para usar las nuevas funciones automáticamente** 🚀
