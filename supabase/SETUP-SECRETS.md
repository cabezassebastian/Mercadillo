# Configurar Variables de Entorno en Supabase

Ve al dashboard de Supabase y configura estas variables:

## 1. Settings > Edge Functions > Secrets

```bash
# Secret para proteger funciones admin
ADMIN_SECRET=mercadillo_admin_2025_secret_key

# Para cuando migremos la función de chat (Fase 3)
GEMINI_API_KEY=tu_gemini_api_key_aqui

# Para cuando migremos emails (Fase 2)
RESEND_API_KEY=tu_resend_api_key_aqui

# Para cuando migremos MercadoPago (Fase 3)
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token_aqui
```

## 2. Obtener el ADMIN_SECRET

Puedes generar uno seguro con:

```powershell
# En PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

O usa este por defecto (recomiendo cambiarlo):
```
mercadillo_admin_2025_secret_key
```

## 3. Agregar al .env.local del proyecto

```bash
# .env.local
VITE_ADMIN_SECRET=mercadillo_admin_2025_secret_key
```

## 4. Comandos para configurar desde CLI

```powershell
# Login
supabase login

# Link al proyecto
supabase link --project-ref xwubnuokmfghtyyfpgtl

# Configurar secrets
supabase secrets set ADMIN_SECRET=mercadillo_admin_2025_secret_key
supabase secrets set GEMINI_API_KEY=tu_key_aqui
supabase secrets set RESEND_API_KEY=tu_key_aqui
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=tu_token_aqui

# Ver secrets configurados
supabase secrets list
```
