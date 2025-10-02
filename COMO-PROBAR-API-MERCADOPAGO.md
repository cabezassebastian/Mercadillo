# 🔧 Cómo probar la API de MercadoPago localmente

## El Problema
Las APIs en la carpeta `/api` de Vercel **NO funcionan con `pnpm run dev`** (Vite).
Necesitas usar **Vercel CLI** para probarlas localmente.

## ✅ Solución 1: Usar Vercel CLI (Recomendado para desarrollo)

### Paso 1: Instalar Vercel CLI
```powershell
npm install -g vercel
```

### Paso 2: Iniciar el servidor de Vercel localmente
```powershell
cd C:\Users\user\Desktop\Mercadillo
vercel dev
```

Esto iniciará:
- Frontend en el puerto que elijas
- APIs de Vercel funcionando correctamente
- Variables de entorno desde `.env` o Vercel

### Paso 3: Probar el checkout
Ahora la API `/api/mercadopago/create-preference` debería funcionar correctamente.

---

## ✅ Solución 2: Desplegar a Vercel (Más rápido para probar)

### Opción A: Push a GitHub (Deploy automático)
```powershell
git add .
git commit -m "fix: mercadopago api changes"
git push
```

Vercel desplegará automáticamente y las APIs funcionarán.

### Opción B: Deploy manual con Vercel CLI
```powershell
vercel --prod
```

---

## 🔍 Verificar Variables de Entorno

Las APIs necesitan estas variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (NO la anon key)
- `MERCADOPAGO_ACCESS_TOKEN`
- `FRONTEND_URL` (opcional)

### En Vercel Dashboard:
1. Ve a tu proyecto en vercel.com
2. Settings → Environment Variables
3. Asegúrate que todas estén configuradas

### En Local (para vercel dev):
Crea un archivo `.env` en la raíz:
```env
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token
FRONTEND_URL=http://localhost:3000
```

---

## 📝 Nota Importante

**`pnpm run dev` NO puede ejecutar APIs de Vercel.**

Tienes 2 opciones:
1. Usar `vercel dev` para desarrollo local con APIs
2. Desplegar a Vercel para probar en producción

**Recomiendo**: Despliega a Vercel y prueba ahí, es más rápido. 🚀
