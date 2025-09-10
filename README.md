# Mercadillo Lima Peru - E-commerce

Un e-commerce moderno y escalable para Lima, Peru, construido con las mejores tecnologias del mercado.

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