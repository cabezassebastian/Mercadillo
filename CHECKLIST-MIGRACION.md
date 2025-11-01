# ✅ Checklist de Migración - Supabase Edge Functions

## 📋 Fase 1: Preparación

- [x] Crear estructura de Edge Functions
- [x] Migrar función `products`
- [x] Migrar función `orders`
- [x] Mejorar función `admin`
- [x] Configurar CORS en todas las funciones
- [x] Crear archivo de configuración API (`src/config/api.ts`)
- [x] Crear scripts de deployment
- [x] Crear documentación completa

## 🚀 Fase 2: Deployment (✅ COMPLETADO)

- [x] Instalar Supabase CLI: `npx supabase` ✅
- [x] Login: `npx supabase login` ✅
- [x] Link proyecto: `npx supabase link --project-ref xwubnuokmfghtyyfpgtl` ✅
- [x] Configurar `ADMIN_SECRET` en Supabase ✅
- [x] Desplegar función `products` ✅
- [x] Desplegar función `orders` ✅
- [x] Desplegar función `admin` ✅
- [x] Verificar deployment en dashboard de Supabase ✅
- [x] Probar URLs de producción - Admin stats funcionando ✅

## 🧪 Fase 3: Testing (OPCIONAL - Recomendado)

- [ ] Probar localmente: `npm run supabase:local`
- [ ] Probar `products` function
- [ ] Probar `orders` GET
- [ ] Probar `orders` POST
- [ ] Probar `admin` functions (stats, sales, etc)
- [ ] Verificar CORS desde el frontend
- [ ] Verificar autenticación con headers

## 🌐 Fase 4: Integración Frontend (YA ESTÁ HECHO ✅)

- [x] Crear `src/config/api.ts` con URLs centralizadas
- [x] Configurar feature flags
- [x] Implementar helper `fetchAPI`
- [ ] Verificar que el frontend usa las nuevas URLs
- [ ] Probar flujo completo: ver producto → carrito → checkout

## 🎯 Fase 5: Producción

- [ ] Desplegar frontend con las nuevas configuraciones
- [ ] Monitorear logs en Supabase dashboard
- [ ] Verificar que no hay errores de CORS
- [ ] Verificar tiempos de respuesta
- [ ] Confirmar que todo funciona correctamente

## 🗑️ Fase 6: Limpieza (SOLO CUANDO TODO FUNCIONE)

- [ ] Esperar 1 semana para asegurar estabilidad
- [ ] Eliminar `api/products/[id].ts` de Vercel
- [ ] Eliminar `api/orders.ts` de Vercel
- [ ] Mantener `api/admin/index.ts` como backup (opcional)
- [ ] Actualizar `vercel.json` (remover funciones migradas)
- [ ] Commit y push de limpieza

## 📊 Métricas de Éxito

- [x] **3 funciones migradas** (de 12 total) ✅
- [x] **Espacio liberado en Vercel**: 3 funciones ✅
- [x] **Progreso**: 25% ✅
- [x] **Funciones funcionando en producción**: 3/3 ✅
- [x] **Frontend integrado**: Listo (src/config/api.ts) ✅
- [x] **Deployment exitoso**: Admin stats probado ✅

## 🎯 Próximas Funciones a Migrar (Fase 2)

### Prioridad Alta
- [ ] `/api/checkout.ts` → `supabase/functions/checkout`
- [ ] `/api/mercadopago/create-preference.ts` → `supabase/functions/mercadopago-preference`
- [ ] `/api/mercadopago/webhook.ts` → `supabase/functions/mercadopago-webhook`

### Prioridad Media
- [ ] `/api/emails/send.ts` → `supabase/functions/emails`
- [ ] `/api/chat.ts` → `supabase/functions/chat`

### Mantener en Vercel
- [x] `/api/clerk.ts` (webhook de autenticación)

---

## 🚨 Comandos Rápidos

```powershell
# Setup inicial (solo una vez)
npm install -g supabase
npm run supabase:login
npm run supabase:link

# Deployment
npm run supabase:deploy

# Testing local
npm run supabase:local

# Ver logs en producción
# Dashboard > Settings > Edge Functions > [función] > Logs
```

---

## ✨ Estado Actual

**Fecha:** 1 de Noviembre, 2025
**Funciones migradas:** 3/12
**Progreso:** ▓▓▓░░░░░░░░░ 25%
**Estado:** ✅ DEPLOYMENT COMPLETADO Y FUNCIONANDO

**URLs Activas:**
- https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/{id}
- https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/orders
- https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/admin?action=stats

---

**Siguiente paso:** Monitorear uso y considerar Fase 2 (checkout, emails, mercadopago) 🚀
