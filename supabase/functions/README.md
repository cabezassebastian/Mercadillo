# 📦 Supabase Edge Functions

Este directorio contiene las Edge Functions de Supabase para el proyecto Mercadillo.

## 🎯 Funciones Disponibles

| Función | Descripción | Estado | URL |
|---------|-------------|--------|-----|
| **products** | Obtener detalles de productos con opciones y variantes | ✅ Activa | `/functions/v1/products/{id}` |
| **orders** | Gestión de pedidos (GET/POST) | ✅ Activa | `/functions/v1/orders` |
| **admin** | Panel administrativo (stats, orders, sales, etc) | ✅ Activa | `/functions/v1/admin?action=...` |
| **checkout** | Crear pedidos pendientes antes del pago | ✅ Activa | `/functions/v1/checkout` |
| **emails** | Envío de emails transaccionales (Resend) | ✅ Activa | `/functions/v1/emails` |
| **mercadopago-preference** | Crear preferencias de pago | ✅ Activa | `/functions/v1/mercadopago-preference` |
| **mercadopago-webhook** | Recibir notificaciones de pago | ✅ Activa | `/functions/v1/mercadopago-webhook` |

## 🚀 Quick Start

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login y Link

```bash
supabase login
supabase link --project-ref xwubnuokmfghtyyfpgtl
```

### 3. Configurar Secrets

```bash
supabase secrets set ADMIN_SECRET=tu_secret_aqui
```

Ver más detalles en [`SETUP-SECRETS.md`](./SETUP-SECRETS.md)

### 4. Desplegar

```bash
# Todas las funciones
supabase functions deploy

# Una función específica
supabase functions deploy products
```

O usar el script de PowerShell:
```powershell
.\deploy-supabase-functions.ps1
```

## 🧪 Testing

### Local

```bash
supabase functions serve
```

O usar el script:
```powershell
.\test-functions-local.ps1
```

### Production

Ver [`TESTING.md`](./TESTING.md) para ejemplos de cURL y testing completo.

## 📝 Documentación

- [`SETUP-SECRETS.md`](./SETUP-SECRETS.md) - Configurar variables de entorno
- [`TESTING.md`](./TESTING.md) - Guía de testing completa
- [`../MIGRACION-SUPABASE-EDGE-FUNCTIONS.md`](../MIGRACION-SUPABASE-EDGE-FUNCTIONS.md) - Documentación de migración

## 🔧 Estructura

```
supabase/functions/
├── admin/                    # Panel administrativo
│   └── index.ts
├── products/                 # Detalles de productos
│   └── index.ts
├── orders/                   # Gestión de pedidos
│   └── index.ts
├── checkout/                 # Crear pedidos pendientes
│   └── index.ts
├── emails/                   # Envío de emails (Resend)
│   └── index.ts
├── mercadopago-preference/   # Crear preferencias de pago
│   └── index.ts
├── mercadopago-webhook/      # Webhook de MercadoPago
│   └── index.ts
├── deno.json                 # Configuración de Deno
├── SETUP-SECRETS.md
├── TESTING.md
└── README.md
```

## 🌐 URLs

### Production
```
https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/{function-name}
```

### Local
```
http://localhost:54321/functions/v1/{function-name}
```

## 🔐 Autenticación

Todas las funciones requieren el header `apikey`:

```typescript
headers: {
  'apikey': SUPABASE_ANON_KEY
}
```

Las funciones admin además requieren:

```typescript
headers: {
  'apikey': SUPABASE_ANON_KEY,
  'x-admin-secret': ADMIN_SECRET
}
```

## 📊 Monitoreo

Ver logs en el dashboard:
1. Settings > Edge Functions
2. Seleccionar función
3. Click en "Logs"

## 🆘 Troubleshooting

| Error | Solución |
|-------|----------|
| Missing apikey | Agregar header `apikey` |
| Forbidden | Verificar `x-admin-secret` |
| Function timeout | Aumentar `maxDuration` en config |
| CORS error | Ya configurado, verificar origin |

## 🔄 Migración desde Vercel

Ver [`../MIGRACION-SUPABASE-EDGE-FUNCTIONS.md`](../MIGRACION-SUPABASE-EDGE-FUNCTIONS.md) para el plan completo de migración.

**Progreso actual:** 7/9 funciones migradas (78%) ✨

### Estado de la migración:
- ✅ **Fase 1 completada** (3/3): products, orders, admin
- ✅ **Fase 2 completada** (4/4): checkout, emails, mercadopago-preference, mercadopago-webhook
- ⏸️ **Fase 3 pendiente** (1/1): chat (Gemini AI)

## 💡 Notas

- Las Edge Functions usan **Deno**, no Node.js
- Imports son URLs, no `node_modules`
- Ejecutan en el **edge** (más rápido)
- **Sin límite** de funciones
- **500K invocaciones/mes** gratis
