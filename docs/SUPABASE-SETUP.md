# 🗄️ Configuración de Supabase - Mercadillo Lima Perú

## 📋 Pasos para Configurar Supabase

### 1. **Crear Proyecto en Supabase**

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub, Google o email
4. Haz clic en "New Project"
5. Completa la información:
   - **Name**: `mercadillo-lima-peru`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: `South America (São Paulo)` (más cerca de Perú)
6. Haz clic en "Create new project"
7. Espera a que se complete la configuración (2-3 minutos)

### 2. **Obtener las Credenciales**

Una vez creado el proyecto:

1. Ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://tu-proyecto-id.supabase.co`
   - **Project API keys** > **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. **Configurar la Base de Datos**

1. Ve a **SQL Editor** en el panel de Supabase
2. Haz clic en "New query"
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Haz clic en "Run" para ejecutar el script
5. Verifica que se hayan creado las tablas:
   - `usuarios`
   - `productos`
   - `pedidos`
   - `reseñas`
   - `categorias`

### 4. **Configurar Políticas de Seguridad (RLS)**

Las políticas ya están incluidas en el script, pero verifica que estén activas:

1. Ve a **Authentication** > **Policies**
2. Verifica que todas las tablas tengan políticas habilitadas
3. Si no están, ejecuta este comando en SQL Editor:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseñas ENABLE ROW LEVEL SECURITY;
```

### 5. **Actualizar Variables de Entorno**

Una vez que tengas las credenciales de Supabase:

1. Abre el archivo `.env.local`
2. Reemplaza estas líneas:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 6. **Configurar Webhooks de Clerk (Opcional)**

Para sincronizar usuarios automáticamente:

1. Ve a **Database** > **Webhooks**
2. Crea un nuevo webhook:
   - **Name**: `clerk-users-sync`
   - **Table**: `usuarios`
   - **Events**: `INSERT`, `UPDATE`, `DELETE`
   - **Type**: `HTTP Request`
   - **URL**: `https://tu-dominio.com/api/clerk-webhook`

### 7. **Verificar la Configuración**

Ejecuta estos comandos para verificar que todo funciona:

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

### 8. **Probar la Conexión**

1. Abre la aplicación en el navegador
2. Intenta registrarte con Clerk
3. Verifica que el usuario aparezca en la tabla `usuarios` de Supabase
4. Intenta agregar productos al carrito
5. Verifica que los productos se carguen desde Supabase

## 🔧 Solución de Problemas

### Error: "Invalid API key"
- Verifica que la clave anónima sea correcta
- Asegúrate de que el proyecto esté activo en Supabase

### Error: "Row Level Security policy"
- Verifica que las políticas RLS estén configuradas
- Asegúrate de que el usuario esté autenticado con Clerk

### Error: "Table doesn't exist"
- Ejecuta el script `supabase-schema.sql` completo
- Verifica que todas las tablas se hayan creado

### Error: "Connection failed"
- Verifica la URL del proyecto
- Asegúrate de que el proyecto esté en la región correcta

## 📊 Verificar en Supabase Dashboard

Una vez configurado, deberías ver:

1. **Table Editor**: Las tablas `usuarios`, `productos`, `pedidos`, etc.
2. **Authentication**: Usuarios registrados desde Clerk
3. **SQL Editor**: Queries ejecutándose correctamente
4. **API**: Documentación automática de la API

## 🎉 ¡Listo!

Una vez completados estos pasos, tu e-commerce estará completamente funcional con:
- ✅ Autenticación con Clerk
- ✅ Base de datos con Supabase
- ✅ Pagos con Stripe
- ✅ Imágenes con Cloudinary

**¡Tu Mercadillo Lima Perú estará listo para vender!** 🛒🇵🇪
