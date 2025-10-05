# Configuración de Webhooks de Clerk para Sincronización con Supabase

## 📋 Problema
Cuando actualizas tu perfil en Clerk (nombre, apellido, email, teléfono), los cambios NO se reflejan automáticamente en Supabase.

## ✅ Solución
Configurar webhooks de Clerk que se disparan cuando hay cambios en el usuario y actualizan Supabase automáticamente.

---

## 🔧 Pasos de Configuración

### 1. Obtener la URL del Webhook

Tu endpoint de webhook será:
```
https://mercadillo.app/api/webhooks/clerk
```

### 2. Configurar en Clerk Dashboard

1. Ve a: https://dashboard.clerk.com
2. Selecciona tu aplicación
3. En el menú lateral, ve a **"Webhooks"**
4. Click en **"+ Add Endpoint"**

### 3. Configurar el Endpoint

Llena los campos así:

**Endpoint URL:**
```
https://mercadillo.app/api/webhooks/clerk
```

**Description (opcional):**
```
Sync user data to Supabase
```

**Subscribe to events:**
Marca estas opciones:
- ✅ `user.created` - Cuando se crea un usuario
- ✅ `user.updated` - Cuando se actualiza un usuario ⭐ (MÁS IMPORTANTE)
- ✅ `user.deleted` - Cuando se elimina un usuario

### 4. Copiar el Signing Secret

Después de crear el webhook, Clerk te mostrará un **Signing Secret** que empieza con `whsec_...`

**CÓPIALO** - lo necesitarás en el siguiente paso.

### 5. Agregar Variable de Entorno

#### En Local (.env.local):
```env
CLERK_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

#### En Vercel (Producción):
1. Ve a https://vercel.com/cabezassebastian/mercadillo/settings/environment-variables
2. Agrega:
   - **Name:** `CLERK_WEBHOOK_SECRET`
   - **Value:** `whsec_tu_secret_aqui` (el que copiaste)
   - **Environment:** Production, Preview, Development
3. Click **"Save"**
4. **Redeploy** tu aplicación

---

## 🧪 Probar el Webhook

### Opción 1: Desde Clerk Dashboard
1. En la página del webhook que creaste
2. Click en **"Testing"** tab
3. Click **"Send Event"**
4. Selecciona `user.updated`
5. Verifica los logs en Vercel

### Opción 2: Actualizar tu perfil
1. Ve a https://mercadillo.app/perfil/configuracion
2. Cambia tu nombre o apellido
3. Guarda los cambios
4. Verifica en Supabase que se haya actualizado

---

## 🔍 Verificar en Supabase

1. Ve a tu proyecto de Supabase
2. SQL Editor o Table Editor
3. Tabla `usuarios`
4. Busca tu registro por email: `contactomercadillo@gmail.com`
5. Verifica que `nombre` y `apellido` coincidan con Clerk

---

## 🐛 Debugging

Si no funciona, verifica:

1. **Logs de Vercel:**
   - https://vercel.com/cabezassebastian/mercadillo/logs
   - Busca: "Clerk webhook received"

2. **Logs de Clerk:**
   - Dashboard → Webhooks → Tu endpoint
   - Verifica el estado de las entregas

3. **Headers del webhook:**
   - Debe tener: `svix-id`, `svix-timestamp`, `svix-signature`

4. **Variable de entorno:**
   - Asegúrate que `CLERK_WEBHOOK_SECRET` esté configurada
   - Debe empezar con `whsec_`

---

## 📚 Eventos que se sincronizan

| Evento Clerk | Acción en Supabase |
|-------------|-------------------|
| `user.created` | INSERT en tabla `usuarios` |
| `user.updated` | UPDATE nombre, apellido, email, teléfono |
| `user.deleted` | DELETE del registro |

---

## ⚡ Beneficios

✅ Sincronización automática Clerk ↔ Supabase
✅ No necesitas código adicional en el frontend
✅ Funciona en tiempo real
✅ Historial de eventos en Clerk Dashboard
✅ Retry automático si falla

---

## 🚨 Importante

- El webhook se dispara SOLO en producción (mercadillo.app)
- En desarrollo local, AuthSync maneja la sincronización
- El secret es sensible - no lo compartas ni lo commitees

---

## 📖 Referencias

- Clerk Webhooks: https://clerk.com/docs/integrations/webhooks
- Svix Verification: https://docs.svix.com/receiving/verifying-payloads/how
