Admin Edge Function
===================

This function is a prototype dispatcher for admin actions (orders, top-products, sales, etc.).

Pedido estado validation
-------------------------
The Edge Function validates `pedidos.estado` against the DB CHECK constraint to avoid 23514 errors.
Allowed values (matching the DB constraint): ['pendiente','pagado','procesando','enviado','entregado','cancelado']

If you need to allow an additional estado (for example 'listo'), you have two options:

- Update the DB CHECK constraint. You can inspect the constraint with:

  SELECT conname, pg_get_constraintdef(c.oid) AS definition
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  WHERE t.relname = 'pedidos' AND c.contype = 'c';

  To alter the constraint, you'll need to DROP and re-CREATE it with the new array of allowed values. Example (run as migration):

  ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
  ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_estado_check CHECK (estado = ANY (ARRAY['pendiente'::text, 'pagado'::text, 'procesando'::text, 'enviado'::text, 'entregado'::text, 'cancelado'::text, 'listo'::text]));

- Or keep the DB constraint and map/validate the incoming estado in the Edge Function (current approach). The function will return 400 with allowed values if a client tries to set an invalid estado.

Security note
-------------
Never call supabase functions that use the SERVICE_ROLE key directly from client-side code. Use a server-side proxy on your domain to add the service role, or implement proper JWT-based admin auth inside the function.

Editor / Deno notes
--------------------
If you see red errors in VS Code inside this folder (Cannot find module 'https://deno.land/...', Cannot find name 'Deno'), install the official Deno extension and enable it for this folder (settings already provided in `.vscode/settings.json`).

Steps:

1. Install Deno (optional for running locally):

   - Windows (PowerShell):

     iwr https://deno.land/install.ps1 -useb | iex

   - Or visit https://deno.land to install manually.

2. In VS Code: install the 'Deno' extension by the Deno team and reload the window. The workspace settings in this folder enable Deno language features for these files.

3. You can continue to develop and deploy functions using the Supabase CLI (`pnpm dlx supabase functions ...`) even if Deno is not installed locally — Supabase will bundle for you.

# Admin Edge Function — despliegue rápido (es)

Este directorio contiene la función Edge `admin` que centraliza los handlers administrativos:
`top-products`, `sales`, `metrics`, `stats`, `product-images`, `orders`.

Resumen rápido
- Recomendado: usar la CLI de Supabase sin instalarla globalmente con `pnpm dlx` (evita problemas de permisos en Windows).
- Antes de desplegar, añade los secretos (SERVICE_ROLE) en el dashboard de Supabase.

Pasos (PowerShell)

1) Loguearte con la CLI (usa pnpm dlx)

```powershell
pnpm dlx supabase login
```

2) Añadir secretos en el Dashboard de Supabase (Project → Settings → Environment Variables / Secrets)

- `SUPABASE_URL` = https://<tu-proyecto>.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` = <service-role-key>
- `ADMIN_SECRET` = <random-string-para-pruebas>  # sólo para pruebas

3) Probar localmente

```powershell
cd C:\Users\user\Desktop\Mercadillo\supabase\functions\admin

# (opcional) setear variables en la sesión para pruebas locales
$env:SUPABASE_URL = "https://<tu-proyecto>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<service-role-key>"
$env:ADMIN_SECRET = "mi-secreto-local"

# servir la función localmente (ejecuta la CLI temporalmente con pnpm dlx)
pnpm dlx supabase functions serve admin

# prueba local (PowerShell):
Invoke-RestMethod -Uri "http://localhost:54321/admin?action=orders" -Headers @{ 'x-admin-secret' = 'mi-secreto-local' }
```

4) Desplegar desde tu máquina

```powershell
pnpm dlx supabase functions deploy admin --project-ref <PROJECT_REF>
```

5) Probar la función desplegada

```powershell
Invoke-RestMethod -Uri "https://<project>.functions.supabase.co/admin?action=orders" -Headers @{ 'x-admin-secret' = '<random-string>' }
```

Notas de seguridad
- No expongas `SUPABASE_SERVICE_ROLE_KEY` en clientes.
- `ADMIN_SECRET` es sólo para pruebas; en producción valida JWT (Clerk o Supabase Auth) dentro de la función y comprueba el rol `admin`.

Problemas comunes en Windows
- Si `pnpm dlx supabase` falla, instala el binario oficial con `winget install supabase.supabase-cli` o descarga el release desde GitHub.

¿Quieres que implemente la validación JWT en la función (Clerk o Supabase Auth)? Dime cuál usas y lo añado.
# Admin Edge Function — despliegue rápido (es)

Este directorio contiene la función Edge `admin` que centraliza los handlers administrativos:
`top-products`, `sales`, `metrics`, `stats`, `product-images`, `orders`.

Pasos resumidos (PowerShell)

1) Instalar Supabase CLI y loguearte

```powershell
npm i -g supabase
supabase login
```

2) Añadir secretos en Supabase (Dashboard → Project → Settings → Environment Variables / Secrets)

- `SUPABASE_URL` = https://<tu-proyecto>.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` = <service-role-key>
- `ADMIN_SECRET` = <random-string-para-pruebas>

3) Probar localmente

```powershell
cd C:\Users\user\Desktop\Mercadillo\supabase\functions\admin
supabase functions serve admin
# abre http://localhost:54321/admin?action=orders (o usa curl/Invoke-RestMethod)
```

4) Desplegar

```powershell
supabase functions deploy admin --project-ref <PROJECT_REF>
```

5) Probar la función desplegada

```powershell
Invoke-RestMethod -Uri "https://<project>.functions.supabase.co/admin?action=orders" -Headers @{ 'x-admin-secret' = '<random-string>' }
```

Seguridad: este prototipo comprueba `x-admin-secret` para simplificar; en producción valida el JWT del usuario (Clerk o Supabase Auth) y verifica permisos.

Si quieres, implemento la validación JWT en la función (dime si usas Clerk o Supabase Auth).
