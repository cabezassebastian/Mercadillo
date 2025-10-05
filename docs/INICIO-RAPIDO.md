# 🚀 Inicio Rápido - Mercadillo Lima Perú

## ⚡ Configuración en 5 Minutos

### 1. **Configurar Keys Automáticamente**
```bash
pnpm configure
```
Esto ejecutará el script `configure-keys.cjs` y creará el archivo `.env.local` con tus keys de Clerk, Stripe y Cloudinary.

### 2. **Instalar Dependencias**
```bash
pnpm install
```

### 3. **Configurar Supabase** (ÚNICO PASO PENDIENTE)
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta el script `supabase-schema.sql` en SQL Editor
4. Copia la URL y ANON_KEY a `.env.local`

### 4. **Ejecutar en Desarrollo**
```bash
pnpm dev
```

### 5. **Verificar Configuración**
```bash
pnpm verify
```

## 🔑 Keys Ya Configuradas

✅ **Clerk**: `pk_test_a25vd24tZG9iZXJtYW4tMTEuY2xlcmsuYWNjb3VudHMuZGV2JA`
✅ **Stripe**: `pk_test_51S3L8sDJ2Uq8pGw9YlYU8y4vtUmTkDuJlQyKvuGqwcC7ekZx3uKVILjGhPAsM76XwOhOfc1l22pX9xxaqpqYkA02007UYskdYH`
✅ **Cloudinary**: `ddbjhpjri` / `mercadillo_upload`

## ⚠️ Solo Falta Supabase

Necesitas crear un proyecto en Supabase y obtener:
- `VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📚 Documentación Completa

- `CONFIGURACION.md` - Guía detallada
- `SUPABASE-SETUP.md` - Configuración de Supabase
- `README.md` - Documentación completa

## 🎯 Una Vez Configurado

Tu e-commerce tendrá:
- 🛒 Catálogo de productos
- 👤 Autenticación de usuarios
- 💳 Pagos con Stripe
- 🖼️ Subida de imágenes
- 📊 Panel de administración
- 🚚 Gestión de pedidos

**¡Solo necesitas configurar Supabase y estará listo!** 🎉
