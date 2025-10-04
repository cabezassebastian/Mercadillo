# 🚨 ALERTA DE SEGURIDAD - ACCIÓN REQUERIDA

## ⚠️ Problema Detectado

El archivo `.env.local` con claves secretas **FUE SUBIDO A GITHUB** en commits anteriores (septiembre 2025). Esto significa que **tus credenciales están expuestas públicamente** en el historial de Git.

**Commits comprometidos:**
- `57c58dab` - "Change .evn.local and others" (Sep 10, 2025)
- Varios commits de "Pull" (Sep 3-4, 2025)

---

## 🔐 CLAVES COMPROMETIDAS QUE DEBES ROTAR

### 1. ✅ Clerk (URGENTE)
**Acción:** Regenerar claves inmediatamente

**Pasos:**
1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecciona tu app "Mercadillo"
3. **API Keys** → Click en "Regenerate"
4. **IMPORTANTE:** Esto invalidará la clave anterior
5. Copia las nuevas claves:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_CLERK_SECRET_KEY`

**Actualizar en:**
- ✅ `.env.local` (local)
- ✅ Vercel Environment Variables

---

### 2. ✅ Supabase (CRÍTICO)
**Acción:** Regenerar Service Role Key

**Pasos:**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Proyecto: `xwubnuokmfghtyyfpgtl`
3. **Settings → API**
4. **service_role key** → Click "Reset"
5. ⚠️ **ADVERTENCIA:** Esto romperá el panel de admin hasta actualizar
6. Copia la nueva clave:
   - `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

**Actualizar en:**
- ✅ `.env.local`
- ✅ Vercel Environment Variables

**NO ROTAR:**
- ❌ `VITE_SUPABASE_ANON_KEY` - Esta es pública, no es problema
- ❌ `VITE_SUPABASE_URL` - Es pública

---

### 3. ✅ Google Gemini AI (URGENTE)
**Acción:** Regenerar API Key

**Pasos:**
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Encuentra tu API key actual
3. Click en "Delete"
4. Click en "Create API Key"
5. Copia la nueva clave:
   - `GEMINI_API_KEY`

**Actualizar en:**
- ✅ `.env.local`
- ✅ Vercel Environment Variables

---

### 4. ✅ MercadoPago (CRÍTICO)
**Acción:** Regenerar Access Token de PRODUCCIÓN

**Pasos:**
1. Ve a [MercadoPago Developers](https://www.mercadopago.com.pe/developers/panel)
2. **Tus aplicaciones → Mercadillo**
3. **Credenciales de producción**
4. Click en "Regenerate" en Access Token
5. ⚠️ **ADVERTENCIA:** Los pagos actuales pueden fallar hasta actualizar
6. Copia las nuevas claves:
   - `MERCADOPAGO_ACCESS_TOKEN`

**NO ROTAR:**
- ❌ `VITE_MERCADOPAGO_PUBLIC_KEY` - Es pública

**Actualizar en:**
- ✅ `.env.local`
- ✅ Vercel Environment Variables

---

### 5. ⚠️ Cloudinary (MEDIA PRIORIDAD)
**Acción:** Opcional pero recomendado

**¿Por qué es menos urgente?**
- Solo permite subir imágenes
- No hay datos sensibles
- Puedes rotar más tarde

**Si decides rotar:**
1. Ve a [Cloudinary Console](https://cloudinary.com/console)
2. **Settings → Upload**
3. Elimina preset `mercadillo_upload`
4. Crea uno nuevo con nombre diferente
5. Actualiza:
   - `VITE_CLOUDINARY_UPLOAD_PRESET`

---

## 📋 Checklist de Seguridad

### Inmediato (HOY)
- [ ] ✅ Regenerar Clerk API keys
- [ ] ✅ Regenerar Supabase Service Role Key
- [ ] ✅ Regenerar Gemini API Key
- [ ] ✅ Regenerar MercadoPago Access Token
- [ ] ✅ Actualizar `.env.local` local con TODAS las nuevas claves
- [ ] ✅ Actualizar Vercel Environment Variables
- [ ] ✅ Hacer Redeploy en Vercel para aplicar nuevas variables
- [ ] ✅ Probar que el sitio funcione correctamente

### Esta Semana
- [ ] Regenerar Cloudinary upload preset (opcional)
- [ ] Revisar logs de Clerk/Supabase por accesos sospechosos
- [ ] Considerar habilitar 2FA en todas las plataformas

### Opcional (Seguridad Avanzada)
- [ ] Limpiar historial de Git (avanzado, puede romper colaboradores)
- [ ] Hacer el repositorio privado en GitHub
- [ ] Configurar GitHub Secret Scanning
- [ ] Implementar rotación automática de claves

---

## 🛡️ Cómo Actualizar Variables en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona proyecto "Mercadillo"
3. **Settings → Environment Variables**
4. Para cada variable comprometida:
   - Click en "Edit"
   - Pega el nuevo valor
   - Asegúrate que esté en: Production, Preview, Development
   - Click "Save"
5. **Deployments → Redeploy** (para aplicar cambios)

---

## 🔍 Verificar Actualización Exitosa

### Después de rotar TODAS las claves:

```bash
# 1. Verificar variables locales
Get-Content .env.local | Select-String "CLERK|SUPABASE|GEMINI|MERCADOPAGO"

# 2. Probar login local
npm run dev
# Intenta hacer login

# 3. Probar panel de admin
# Ve a /admin y crea un producto

# 4. Probar chatbot
# Abre el chatbot y busca productos

# 5. Probar checkout
# Agrega producto al carrito y paga
```

---

## 📖 Prevención Futura

### ✅ Ya Implementado:
- `.gitignore` actualizado con protección de `.env*`
- Variables locales NO se suben a GitHub

### 🎯 Mejores Prácticas:
1. **NUNCA** hacer commit de archivos `.env*`
2. **SIEMPRE** verificar con `git status` antes de commit
3. **USAR** `env.local.example` como plantilla (sin valores reales)
4. **ROTAR** claves cada 3-6 meses
5. **HABILITAR** alertas de seguridad en GitHub

---

## 🚨 Si Ves Actividad Sospechosa

### Señales de compromiso:
- Pagos no autorizados en MercadoPago
- Usuarios creados que no reconoces
- Emails de login desde ubicaciones extrañas
- Aumento inexplicable en uso de API

### Acción inmediata:
1. **DESACTIVAR** todas las claves comprometidas
2. **REPORTAR** a soporte de cada plataforma
3. **REVISAR** logs de acceso
4. **CAMBIAR** contraseñas de todas las cuentas

---

## 📞 Contactos de Soporte

- **Clerk:** https://clerk.com/support
- **Supabase:** https://supabase.com/dashboard/support
- **MercadoPago:** https://www.mercadopago.com.pe/developers/es/support
- **Google Cloud:** https://cloud.google.com/support
- **Cloudinary:** https://support.cloudinary.com

---

## ⏱️ Tiempo Estimado

- **Rotar todas las claves:** 15-20 minutos
- **Actualizar Vercel:** 5 minutos
- **Redeploy y verificar:** 10 minutos
- **TOTAL:** ~30-35 minutos

---

## ✅ Cuando Termines

Una vez que hayas rotado TODAS las claves y verificado que todo funciona:

1. Elimina este archivo: `SECURITY-ALERT.md`
2. Guarda las nuevas claves en un **gestor de contraseñas** (1Password, Bitwarden)
3. **NUNCA** las compartas públicamente
4. Configura alertas de seguridad

---

**Fecha de alerta:** Octubre 3, 2025  
**Severidad:** 🔴 CRÍTICA  
**Estado:** ⏳ PENDIENTE - Requiere acción inmediata

---

¿Necesitas ayuda? Contacta: cabezassebastian08@gmail.com
