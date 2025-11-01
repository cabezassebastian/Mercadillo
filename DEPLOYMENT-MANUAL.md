# 🚀 Deployment Manual - Supabase Edge Functions

## Opción 1: Usar el Dashboard de Supabase (MÁS FÁCIL)

### Paso 1: Ve al Dashboard
https://supabase.com/dashboard/project/xwubnuokmfghtyyfpgtl/functions

### Paso 2: Crear las funciones manualmente

#### Función 1: products
1. Click en "Create a new function"
2. Nombre: `products`
3. Copiar el código de: `supabase/functions/products/index.ts`
4. Deploy

#### Función 2: orders
1. Click en "Create a new function"
2. Nombre: `orders`
3. Copiar el código de: `supabase/functions/orders/index.ts`
4. Deploy

#### Función 3: admin
1. Click en "Create a new function"
2. Nombre: `admin`
3. Copiar el código de: `supabase/functions/admin/index.ts`
4. Deploy

### Paso 3: Configurar Secrets
Settings > Edge Functions > Secrets

Agregar:
```
ADMIN_SECRET = mercadillo_admin_2025_secret_key
```

---

## Opción 2: Usar Supabase CLI (desde el proyecto)

### Si Scoop terminó de instalar:

```powershell
# Verificar instalación
scoop install supabase

# Login
supabase login

# Link
supabase link --project-ref xwubnuokmfghtyyfpgtl

# Deploy
supabase functions deploy
```

### Si NO tienes Scoop:

```powershell
# Usar npx (temporal, pero funciona)
npx -y supabase login
npx -y supabase link --project-ref xwubnuokmfghtyyfpgtl
npx -y supabase functions deploy
```

---

## Opción 3: Instalación Local de Supabase CLI

### Descargar binario directo:

1. Ve a: https://github.com/supabase/cli/releases/latest
2. Descarga: `supabase_windows_amd64.zip`
3. Extraer a: `C:\Program Files\Supabase\`
4. Agregar a PATH:
   ```powershell
   $env:Path += ";C:\Program Files\Supabase"
   ```

---

## ✅ RECOMENDACIÓN: Opción 1 (Dashboard)

Es la más rápida y no requiere instalación. Solo:

1. Ir al dashboard
2. Copiar/pegar el código de cada función
3. Deploy
4. Configurar secrets
5. ¡Listo!

---

## 🧪 Testing después del deployment

```powershell
# Test products
curl "https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/1" `
  -H "apikey: tu_anon_key"

# Test admin
curl "https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/admin?action=stats" `
  -H "apikey: tu_anon_key" `
  -H "x-admin-secret: mercadillo_admin_2025_secret_key"
```

---

**Link directo al dashboard:**
https://supabase.com/dashboard/project/xwubnuokmfghtyyfpgtl/functions
