# 🚀 Guía de Deployment - Mercadillo

> Guía completa para desplegar Mercadillo en producción con Vercel, Supabase, Clerk y servicios externos.

---

## 📋 Pre-requisitos

Antes de desplegar, asegúrate de tener cuentas en:

- ✅ [Vercel](https://vercel.com) - Hosting y serverless functions
- ✅ [Supabase](https://supabase.com) - Base de datos PostgreSQL
- ✅ [Clerk](https://clerk.com) - Autenticación
- ✅ [Cloudinary](https://cloudinary.com) - Gestión de imágenes
- ✅ [MercadoPago](https://www.mercadopago.com.pe/developers) - Pasarela de pagos
- ✅ [Google AI Studio](https://aistudio.google.com) - API de Gemini

---

## 🗄️ Paso 1: Configurar Supabase

### 1.1 Crear Proyecto
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en "New Project"
3. Nombre: `mercadillo-prod`
4. Región: `South America (São Paulo)` (más cercana a Perú)
5. Contraseña de DB: Genera una segura

### 1.2 Ejecutar Scripts SQL

En **SQL Editor**, ejecuta en orden:

**1. Schema Principal:**
```bash
# Copiar y ejecutar: supabase-schema.sql
```

**2. Migraciones del Chatbot:**
```bash
# Copiar y ejecutar: supabase-chat-migrations.sql
```

**3. Desactivar RLS (IMPORTANTE):**
```bash
# Copiar y ejecutar: fix-rls-DISABLE.sql
```

### 1.3 Verificar RLS Desactivado

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('productos', 'usuarios', 'pedidos');
```

✅ Resultado esperado: `rowsecurity = false`

### 1.4 Obtener Credenciales

En **Settings → API**:
- `VITE_SUPABASE_URL`: Project URL
- `VITE_SUPABASE_ANON_KEY`: anon/public key
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: service_role key ⚠️ **SECRETO**

---

## 🔐 Paso 2: Configurar Clerk

### 2.1 Crear Aplicación
1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Click en "Add Application"
3. Nombre: `Mercadillo`
4. Autenticación: Email, Google, GitHub (opcional)

### 2.2 Configurar Dominio
1. En **Domains**, agrega: `www.mercadillo.app`
2. Sigue las instrucciones de DNS

### 2.3 Obtener Credenciales

En **API Keys**:
- `VITE_CLERK_PUBLISHABLE_KEY`: Publishable key
- `VITE_CLERK_SECRET_KEY`: Secret key ⚠️ **SECRETO**

### 2.4 Configurar Sincronización con Supabase

En **Webhooks**:
- URL: `https://www.mercadillo.app/api/clerk-webhook`
- Eventos: `user.created`, `user.updated`
- Signing Secret: Guarda para variable de entorno

---

## 🖼️ Paso 3: Configurar Cloudinary

### 3.1 Crear Cuenta
1. Ve a [Cloudinary](https://cloudinary.com)
2. Regístrate gratis (hasta 25GB/mes)

### 3.2 Crear Upload Preset
1. **Settings → Upload**
2. **Upload Presets → Add Upload Preset**
3. Nombre: `mercadillo_upload`
4. Signing Mode: **Unsigned**
5. Folder: `mercadillo`

### 3.3 Obtener Credenciales

En **Dashboard**:
- `VITE_CLOUDINARY_CLOUD_NAME`: Cloud name
- Upload Preset: `mercadillo_upload`

---

## 💳 Paso 4: Configurar MercadoPago

### 4.1 Crear Aplicación
1. Ve a [MercadoPago Developers](https://www.mercadopago.com.pe/developers/panel)
2. **Tus aplicaciones → Crear aplicación**
3. Nombre: `Mercadillo`
4. **Importante:** Activa modo PRODUCCIÓN

### 4.2 Configurar Webhooks
1. En **Webhooks**, agrega:
   - URL: `https://www.mercadillo.app/api/mercadopago/webhook`
   - Eventos: `payment`, `merchant_order`

### 4.3 Obtener Credenciales

En **Credenciales de producción**:
- `VITE_MERCADOPAGO_PUBLIC_KEY`: Public Key
- `MERCADOPAGO_ACCESS_TOKEN`: Access Token ⚠️ **SECRETO**

---

## 🤖 Paso 5: Configurar Google Gemini AI

### 5.1 Obtener API Key
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click en "Create API Key"
3. Selecciona proyecto o crea uno nuevo

### 5.2 Límites (Free Tier)
- **60 requests/minuto**
- **86,400 requests/día**
- **Gratis permanentemente**

Credencial:
- `GEMINI_API_KEY`: Tu API key ⚠️ **SECRETO**

---

## 🚀 Paso 6: Deploy en Vercel

### 6.1 Conectar Repositorio

1. Ve a [Vercel](https://vercel.com/new)
2. **Import Git Repository**
3. Selecciona: `cabezassebastian/Mercadillo`
4. Click en **Import**

### 6.2 Configurar Variables de Entorno

En **Environment Variables**, agrega:

#### Frontend (VITE_*)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
VITE_CLOUDINARY_CLOUD_NAME=ddbjhpjri
VITE_CLOUDINARY_UPLOAD_PRESET=mercadillo_upload
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
```

#### Backend (sin VITE_)
```env
CLERK_SECRET_KEY=sk_live_...
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
GEMINI_API_KEY=AIzaSyB...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
```

⚠️ **Importante:** Agrega TODAS las variables para `Production`, `Preview`, y `Development`.

### 6.3 Deploy
1. Click en **Deploy**
2. Espera ~2 minutos
3. ✅ Tu app estará en: `https://mercadillo.vercel.app`

### 6.4 Configurar Dominio Personalizado

1. En Vercel → **Settings → Domains**
2. Agrega: `www.mercadillo.app`
3. Configura DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 🔧 Paso 7: Configuración Post-Deploy

### 7.1 Crear Usuario Admin

En Supabase SQL Editor:

```sql
-- Primero, regístrate en la app con tu email
-- Luego ejecuta:
UPDATE usuarios 
SET rol = 'admin' 
WHERE email = 'tu-email@example.com';
```

### 7.2 Agregar Productos Iniciales

1. Ve a `https://www.mercadillo.app/admin`
2. Login con tu cuenta admin
3. **Productos → Crear Producto**
4. Sube imagen desde Cloudinary
5. Llena todos los campos

### 7.3 Probar Checkout

1. Agregar producto al carrito
2. Ir a `/checkout`
3. Completar datos
4. Click en "Pagar con MercadoPago"
5. Usar tarjeta de prueba:
   ```
   Número: 5031 7557 3453 0604
   Vencimiento: 11/25
   CVV: 123
   ```

### 7.4 Probar Chatbot

1. Click en botón flotante del chatbot
2. Escribe: "buscar laptops"
3. Verifica que muestre productos
4. Prueba agregar al carrito desde el chat

---

## 📊 Monitoreo y Logs

### Vercel Analytics
1. **Analytics** → Ver métricas de visitas
2. **Logs** → Ver errores de serverless functions

### Supabase Logs
1. **Logs** → Ver queries de DB
2. **Database** → Monitorear performance

### MercadoPago Dashboard
1. Ver pagos en **Actividad**
2. Verificar webhooks en **Webhooks**

---

## 🔄 CI/CD - Deploy Automático

### Git Workflow

```bash
# Desarrollo
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# Pull Request → Preview Deploy automático
# Merge a main → Production Deploy automático
```

### Preview Deployments
- Cada PR crea un preview único
- URL: `mercadillo-git-<branch>.vercel.app`
- Ideal para testing antes de producción

---

## ⚠️ Troubleshooting

### Error: "Clerk not loaded"
**Solución:** Verificar `VITE_CLERK_PUBLISHABLE_KEY` en Vercel

### Error: "Supabase 500"
**Solución:** Verificar que RLS esté desactivado con `fix-rls-DISABLE.sql`

### Error: "MercadoPago payment failed"
**Solución:** Verificar `MERCADOPAGO_ACCESS_TOKEN` y que sea de **producción**

### Error: "Gemini API rate limit"
**Solución:** Esperar 1 minuto o upgrade a plan pagado

### Panel de Admin no carga
**Solución:** 
1. Verificar rol en DB: `SELECT rol FROM usuarios WHERE email = '...'`
2. Debe ser `'admin'` exactamente

---

## 🔐 Seguridad en Producción

### Checklist
- ✅ RLS desactivado pero autenticación con Clerk activa
- ✅ Service Role Key solo en variables de entorno (nunca en código)
- ✅ HTTPS habilitado (automático en Vercel)
- ✅ CORS configurado correctamente en `/api/*`
- ✅ Validación de datos en frontend Y backend
- ✅ Rate limiting en Gemini AI (60/min)

---

## 📝 Checklist Final de Deploy

- [ ] Supabase configurado y scripts ejecutados
- [ ] Clerk configurado con dominio
- [ ] Cloudinary con upload preset
- [ ] MercadoPago en modo producción
- [ ] Gemini API key obtenida
- [ ] Variables de entorno en Vercel (todas)
- [ ] Deploy exitoso en Vercel
- [ ] Dominio personalizado configurado
- [ ] Usuario admin creado en DB
- [ ] Productos de prueba creados
- [ ] Checkout testeado con tarjeta de prueba
- [ ] Chatbot funcionando
- [ ] Analytics monitoreando

---

## 🎉 ¡Deploy Completado!

Tu tienda está online en: **https://www.mercadillo.app**

**Próximos pasos:**
1. Agregar productos reales
2. Configurar políticas de envío
3. Promocionar en redes sociales
4. Monitorear analytics y optimizar

**Soporte:** cabezassebastian08@gmail.com

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0
