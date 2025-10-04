# 🛒 Mercadillo - E-commerce Platform

> Plataforma de e-commerce moderna y completa para Perú, con chatbot AI integrado y panel de administración.

**🌐 En producción:** [https://www.mercadillo.app](https://www.mercadillo.app)

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool ultrarrápido
- **TypeScript** - Tipado estático
- **TailwindCSS** - Framework de CSS utility-first
- **React Router DOM** - Enrutamiento SPA
- **Framer Motion** - Animaciones fluidas
- **React Query** - Gestión de estado del servidor

### Backend & Servicios
- **Clerk** - Autenticación y gestión de usuarios
- **Supabase** - Base de datos PostgreSQL con API REST
- **MercadoPago** - Pasarela de pagos para LATAM
- **Cloudinary** - CDN y gestión de imágenes optimizadas
- **Vercel** - Hosting y serverless functions
- **Google Gemini AI** - Chatbot inteligente con búsqueda de productos

### Características Destacadas
- ✅ **Chatbot AI** con Google Gemini 2.0 Flash
  - Búsqueda inteligente de productos
  - Agregar al carrito desde el chat
  - Persistencia de conversaciones
  - Contador de mensajes sin leer
  - Dashboard de analytics
- ✅ **Panel de Admin** completo con Service Role Key
- ✅ **Pagos** con MercadoPago (producción)
- ✅ **RLS Desactivado** para simplificar autenticación
- ✅ **Sincronización** Clerk ↔ Supabase
- ✅ **Diseño Responsive** - Mobile-first

---

## 📁 Estructura del Proyecto

```
Mercadillo/
├── api/                      # Vercel Serverless Functions
│   ├── chat.ts              # Endpoint del chatbot AI (Gemini)
│   ├── checkout.ts          # Procesamiento de pagos
│   └── mercadopago/         # Webhooks de MercadoPago
├── src/
│   ├── components/
│   │   ├── Admin/           # Panel de administración
│   │   ├── Auth/            # Autenticación (Clerk)
│   │   ├── Cart/            # Carrito de compras
│   │   ├── ChatBot/         # Chatbot AI ⭐ NUEVO
│   │   ├── Layout/          # Header, Footer, Navbar
│   │   ├── Product/         # Cards, detalles, filtros
│   │   └── User/            # Perfil, pedidos, direcciones
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Clerk + Supabase sync
│   │   └── CartContext.tsx  # Estado del carrito
│   ├── lib/
│   │   ├── supabase.ts      # Cliente público (ANON_KEY)
│   │   ├── supabaseAdmin.ts # Cliente admin (SERVICE_ROLE_KEY) ⭐
│   │   └── mercadopago.ts   # SDK de MercadoPago
│   └── pages/               # Rutas de la aplicación
├── supabase/                # Configuración local (opcional)
├── fix-rls-DISABLE.sql      # Script para desactivar RLS ⭐
├── supabase-schema.sql      # Schema completo de la DB
└── supabase-chat-migrations.sql  # Migraciones del chatbot
```

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/cabezassebastian/Mercadillo.git
cd Mercadillo
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea `.env.local` en la raíz:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsubWVyY2FkaWxsby5hcHAk
VITE_CLERK_SECRET_KEY=sk_live_...

# Supabase Database
VITE_SUPABASE_URL=https://xwubnuokmfghtyyfpgtl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # ⭐ Para admin panel

# Cloudinary Images
VITE_CLOUDINARY_CLOUD_NAME=ddbjhpjri
VITE_CLOUDINARY_UPLOAD_PRESET=mercadillo_upload

# MercadoPago - PRODUCCIÓN
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-4ec080b8-74c5-4558-b6c2-0b0dcc31bda8
MERCADOPAGO_ACCESS_TOKEN=APP_USR-5101834776453209-092922-...

# Google Gemini AI (Chatbot)
GEMINI_API_KEY=AIzaSyB0iMvubBq3yp3ZC8UiI86p5pAxhvylX7U

# Variables para Vercel Backend
SUPABASE_URL=https://xwubnuokmfghtyyfpgtl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 4. Configurar Supabase

1. **Crear proyecto** en [Supabase](https://supabase.com)
2. **Ejecutar scripts SQL** en orden:
   ```sql
   -- 1. Schema principal
   supabase-schema.sql
   
   -- 2. Migraciones del chatbot
   supabase-chat-migrations.sql
   
   -- 3. Desactivar RLS (IMPORTANTE)
   fix-rls-DISABLE.sql
   ```

3. **Verificar que RLS esté desactivado**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('productos', 'usuarios', 'pedidos');
   -- rowsecurity debe ser 'false'
   ```

### 5. Configurar roles de usuario

Para hacer admin a un usuario:

```sql
UPDATE usuarios 
SET rol = 'admin' 
WHERE email = 'tu-email@example.com';
```

---

## 🚀 Comandos Disponibles

```bash
# Desarrollo local (http://localhost:5173)
pnpm dev

# Build para producción
pnpm build

# Preview del build
pnpm preview

# Linting
pnpm lint
```

---

## 📱 Funcionalidades

### 🛍️ Para Clientes
- ✅ Registro/Login con Clerk (email, Google, GitHub)
- ✅ Explorar catálogo con filtros avanzados
- ✅ Búsqueda de productos
- ✅ Agregar productos al carrito
- ✅ Checkout con MercadoPago
- ✅ **Chatbot AI** - Buscar productos y agregar al carrito
- ✅ Historial de pedidos
- ✅ Gestión de direcciones
- ✅ Sistema de reseñas
- ✅ Modo oscuro

### 👨‍💼 Para Administradores
- ✅ Panel de admin completo (`/admin`)
- ✅ **Botón de admin en menú de usuario** (solo para admins)
- ✅ CRUD de productos con Cloudinary
- ✅ Gestión de usuarios y roles
- ✅ Gestión de pedidos y estados
- ✅ Dashboard con estadísticas
- ✅ **Analytics del chatbot** (`/admin/chat-analytics`)
- ✅ Vista de conversaciones

### 🤖 Chatbot AI (Google Gemini)
- ✅ Búsqueda inteligente de productos
- ✅ Recomendaciones personalizadas
- ✅ Agregar productos al carrito desde el chat
- ✅ Persistencia de conversaciones en DB
- ✅ Contador de mensajes sin leer
- ✅ Dashboard de analytics para admins
- ✅ Soporte multiidioma (español)

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales
| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios sincronizados con Clerk |
| `productos` | Catálogo de productos |
| `pedidos` | Pedidos de clientes |
| `reseñas` | Reseñas de productos |
| `chat_conversations` | Historial del chatbot ⭐ |
| `direcciones` | Direcciones de envío |

### ⚠️ RLS Desactivado
Por decisión de arquitectura, **RLS está desactivado** en todas las tablas principales (`productos`, `usuarios`, `pedidos`). La seguridad se maneja mediante:
- **Clerk** para autenticación a nivel de aplicación
- **Service Role Key** para operaciones de admin
- **Validación** en API routes de Vercel

---

## 🔒 Seguridad

- ✅ Autenticación con **Clerk** (JWT tokens)
- ✅ Panel de admin usa **Service Role Key**
- ✅ Variables de entorno protegidas
- ✅ HTTPS en producción (Vercel)
- ✅ Validación de datos en frontend y backend
- ✅ CORS configurado correctamente

---

## 🚀 Despliegue en Vercel

### Variables de Entorno Requeridas

En **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
# Frontend (VITE_*)
VITE_CLERK_PUBLISHABLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY  # ⭐ IMPORTANTE
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_MERCADOPAGO_PUBLIC_KEY

# Backend (sin VITE_)
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
MERCADOPAGO_ACCESS_TOKEN
```

### Deploy Automático
- Push a `main` → Deploy automático en Vercel
- Preview deployments en PRs
- Rollback con un click

---

## 📊 Monitoreo

- **Vercel Analytics** - Performance y visitas
- **Supabase Dashboard** - Queries y logs de DB
- **MercadoPago Dashboard** - Pagos y transacciones
- **Clerk Dashboard** - Usuarios y sesiones
- **Chatbot Analytics** - Métricas del chatbot AI

---

## 🎯 Roadmap Completado

- [x] ~~Integración con MercadoPago~~ ✅
- [x] ~~Panel de administración~~ ✅
- [x] ~~Chatbot AI con Google Gemini~~ ✅
- [x] ~~Analytics del chatbot~~ ✅
- [x] ~~Botón de admin en menú de usuario~~ ✅
- [x] ~~Desactivar RLS para simplificar~~ ✅

### Próximas Mejoras
- [ ] Sistema de cupones y descuentos
- [ ] Notificaciones push
- [ ] Integración con WhatsApp Business
- [ ] App móvil (React Native)
- [ ] Sistema de inventario avanzado
- [ ] Multi-tenant para vendedores

---

## 📞 Contacto y Soporte

**Desarrollador:** Sebastian CQ  
**Email:** cabezassebastian08@gmail.com  
**WhatsApp:** +51 957 037 207  
**Website:** [https://www.mercadillo.app](https://www.mercadillo.app)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Mercadillo** - Tu tienda online de confianza en Perú 🇵🇪 🛒

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estatico
- **TailwindCSS** - Framework de CSS
- **React Router DOM** - Enrutamiento
- **Framer Motion** - Animaciones y transiciones de pagina

### Backend & Servicios
- **Clerk** - Autenticacion y gestion de usuarios
- **Supabase** - Base de datos PostgreSQL
- **Stripe** - Pasarela de pagos internacional
- **Cloudinary** - Gestion de imagenes
- **Vercel** - Hosting y serverless functions

### Herramientas de Desarrollo
- **ESLint** - Linter
- **pnpm** - Package manager
- **PostCSS** - Procesador de CSS

## 🎨 Paleta de Colores

```css
--amarillo: #FFD700
--dorado: #b8860b
--blanco: #ffffff
--hueso: #f5f1e9
--gris-oscuro: #333333
--gris-claro: #aaa
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Admin/          # Componentes del panel admin
│   ├── Auth/           # Componentes de autenticacion
│   ├── Layout/         # Layout y navegacion
│   └── Product/        # Componentes de productos
├── contexts/           # Contextos de React
├── lib/               # Configuraciones y utilidades
├── pages/             # Paginas de la aplicacion
└── main.tsx           # Punto de entrada
```

## 🛠️ Instalacion y Configuracion

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd mercadillo-lima-peru
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
Copia el archivo `env.example` y renombralo a `.env.local`:

```bash
cp env.example .env.local
```

Configura las siguientes variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsubWVyY2FkaWxsby5hcHAk

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Configurar Supabase
1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script `supabase-schema.sql` en el SQL Editor
3. Configura las politicas de seguridad (RLS)

### 5. Configurar Clerk
1. Crea una aplicacion en [Clerk](https://clerk.com)
2. Configura los metodos de autenticacion
3. Obtén las claves de la aplicacion

### 6. Configurar Stripe
1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén las claves de API
3. Configura los webhooks para `/api/webhook`

### 7. Configurar Cloudinary
1. Crea una cuenta en [Cloudinary](https://cloudinary.com)
2. Configura un upload preset
3. Obtén las credenciales

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
pnpm dev

# Build para produccion
pnpm build

# Preview del build
pnpm preview

# Linting
pnpm lint
```

## 📱 Funcionalidades

### Para Clientes
- ✅ Autenticacion segura con Clerk y sincronizacion con Supabase
- ✅ Catalogo de productos con filtros y busqueda
- ✅ Pagina de producto individual
- ✅ Carrito de compras persistente
- ✅ Checkout con Stripe
- ✅ Perfil de usuario con historial de pedidos

### Para Administradores
- ✅ Panel de administracion completo
- ✅ CRUD de productos
- ✅ Gestion de pedidos
- ✅ Gestion de usuarios
- ✅ Dashboard con estadisticas
- ✅ Subida de imagenes a Cloudinary

### Caracteristicas Tecnicas
- ✅ Diseño responsivo para multiples dispositivos
- ✅ Manejo robusto de errores con ErrorBoundary
- ✅ Optimizacion de imagenes para carga rapida
- ✅ Calculo automatico de IGV (18%)
- ✅ Estados de pedidos para seguimiento
- ✅ Politicas de seguridad (RLS) en Supabase
- ✅ API endpoints serverless para operaciones criticas
- ✅ Transiciones de pagina fluidas con Framer Motion

## 🗄️ Base de Datos

### Tablas Principales
- `usuarios` - Informacion de usuarios (sincronizada con Clerk)
- `productos` - Catalogo de productos
- `pedidos` - Pedidos de clientes
- `reseñas` - Reseñas de productos
- `categorias` - Categorias de productos

### Relaciones
- Usuario → Pedidos (1:N)
- Producto → Reseñas (1:N)
- Usuario → Reseñas (1:N)

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Politicas de acceso** basadas en roles
- **Autenticacion** manejada por Clerk
- **Validacion** de datos en frontend y backend
- **Sanitizacion** de inputs

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automaticamente

### Variables de Entorno para Produccion
```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsubWVyY2FkaWxsby5hcHAk
VITE_CLERK_SECRET_KEY=sk_live_eOa7rnDzNSWzhuOR7qXvGKnbFt2LlljzkXN1wDLgQl

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

## 📊 Monitoreo y Analytics

- **Vercel Analytics** - Metricas de rendimiento
- **Supabase Dashboard** - Monitoreo de base de datos
- **Stripe Dashboard** - Monitoreo de pagos
- **Clerk Dashboard** - Gestion de usuarios

## 🤝 Contribucion

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto esta bajo la Licencia MIT. Ver el archivo `LICENSE` para mas detalles.

## 📞 Soporte

Para soporte tecnico o preguntas:
- Email: cabezassebastian08@gmail.com
- WhatsApp: +51 957 037 207

## 🎯 Roadmap

### Proximas Funcionalidades
- [ ] Sistema de cupones y descuentos
- [ ] Integracion con Mercado Pago
- [ ] Notificaciones push
- [ ] Chat en vivo
- [ ] Sistema de afiliados
- [ ] App movil (React Native)
- [ ] Integracion con redes sociales
- [ ] Sistema de inventario avanzado

---

**Mercadillo Lima Peru** - Tu tienda online de confianza 🛒