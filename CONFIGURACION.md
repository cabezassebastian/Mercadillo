# 🔧 Guía de Configuración - Mercadillo Lima Perú

## 📋 Pasos para Implementar las Keys

### 1. **Configurar Variables de Entorno**

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_tu_clerk_key_aqui

# Supabase Database
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_key_aqui

# Cloudinary Images
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset

# Mercado Pago (Opcional)
VITE_MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_key_aqui
```

### 2. **Configurar Supabase**

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Anota la URL y la clave anónima

2. **Ejecutar el esquema de base de datos:**
   - Ve al SQL Editor en Supabase
   - Copia y pega el contenido de `supabase-schema.sql`
   - Ejecuta el script

3. **Configurar políticas de seguridad:**
   - Las políticas RLS ya están incluidas en el script
   - Verifica que estén habilitadas en Authentication > Policies

### 3. **Configurar Clerk**

1. **Crear aplicación en Clerk:**
   - Ve a [clerk.com](https://clerk.com)
   - Crea una nueva aplicación
   - Configura los métodos de autenticación (Email, Google, etc.)

2. **Configurar webhooks (opcional):**
   - URL: `https://tu-dominio.com/api/clerk-webhook`
   - Eventos: `user.created`, `user.updated`, `user.deleted`

### 4. **Configurar Stripe**

1. **Crear cuenta en Stripe:**
   - Ve a [stripe.com](https://stripe.com)
   - Crea una cuenta de desarrollador
   - Obtén las claves de API

2. **Configurar webhooks:**
   - URL: `https://tu-dominio.com/api/webhook`
   - Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

### 5. **Configurar Cloudinary**

1. **Crear cuenta en Cloudinary:**
   - Ve a [cloudinary.com](https://cloudinary.com)
   - Crea una cuenta gratuita
   - Obtén el Cloud Name

2. **Configurar Upload Preset:**
   - Ve a Settings > Upload
   - Crea un nuevo Upload Preset
   - Configura como "Unsigned" para subidas desde el frontend

### 6. **Configurar Vercel (Producción)**

1. **Variables de entorno en Vercel:**
   ```env
   STRIPE_SECRET_KEY=sk_live_tu_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
   SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
   ```

2. **Desplegar:**
   - Conecta tu repositorio a Vercel
   - Las variables de entorno se configuran automáticamente
   - Despliega

## 🚀 Comandos de Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
pnpm setup

# 3. Ejecutar en desarrollo
pnpm dev

# 4. Build para producción
pnpm build
```

## 🔍 Verificación de Configuración

### Verificar que todo funciona:

1. **Frontend:**
   - La aplicación carga sin errores
   - Puedes registrarte e iniciar sesión
   - El catálogo muestra productos

2. **Base de datos:**
   - Los usuarios se crean en Supabase
   - Los productos se cargan correctamente
   - Las políticas de seguridad funcionan

3. **Pagos:**
   - El checkout redirige a Stripe
   - Los webhooks actualizan el estado de los pedidos
   - Los pagos se procesan correctamente

4. **Imágenes:**
   - Las imágenes se suben a Cloudinary
   - Se muestran optimizadas en la aplicación

## 🛠️ Solución de Problemas

### Error: "Missing environment variables"
- Verifica que el archivo `.env.local` existe
- Asegúrate de que las variables empiecen con `VITE_`
- Reinicia el servidor de desarrollo

### Error: "Supabase connection failed"
- Verifica la URL y clave de Supabase
- Asegúrate de que el proyecto esté activo
- Verifica las políticas de seguridad

### Error: "Stripe checkout failed"
- Verifica las claves de Stripe
- Asegúrate de que los webhooks estén configurados
- Verifica que el dominio esté en la lista de dominios permitidos

### Error: "Cloudinary upload failed"
- Verifica el Cloud Name y Upload Preset
- Asegúrate de que el preset esté configurado como "Unsigned"
- Verifica los permisos de la cuenta

## 📞 Soporte

Si tienes problemas con la configuración:
- Revisa los logs en la consola del navegador
- Verifica los logs de Vercel (si estás en producción)
- Consulta la documentación de cada servicio

---

**¡Tu e-commerce está listo para funcionar!** 🎉
