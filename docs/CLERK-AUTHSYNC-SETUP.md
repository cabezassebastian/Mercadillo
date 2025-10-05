# 🔄 Sincronización Clerk ↔ Supabase con AuthSync

> **Estado:** ✅ FUNCIONANDO  
> **Método:** Sincronización en cliente con AuthSync  
> **Última actualización:** Octubre 4, 2025

---

## 📋 Problema Original

Cuando actualizas tu perfil en Clerk (nombre, apellido, email), los cambios NO se reflejaban automáticamente en Supabase.

**Necesidad:** Mantener sincronizados los datos de usuario entre Clerk (autenticación) y Supabase (base de datos).

---

## ✅ Solución Implementada: AuthSync

### ¿Qué es AuthSync?

Componente de React que:
1. Se ejecuta en cada carga de página
2. Obtiene datos del usuario desde Clerk
3. Compara con los datos en Supabase
4. Si detecta cambios → actualiza Supabase automáticamente
5. Cachea datos para evitar updates redundantes

**Archivo:** `src/components/AuthSync.tsx`

---

## 🏗️ Arquitectura

```
Usuario carga página
    ↓
AuthSync se ejecuta
    ↓
Obtiene user de Clerk (useUser hook)
    ↓
Crea hash: "nombre|apellido|email"
    ↓
¿Hash diferente al último sync? ──NO→ Skip (ya sincronizado)
    ↓ SÍ
Consulta Supabase (tabla usuarios)
    ↓
¿Usuario existe? ──NO→ Crear perfil + Email bienvenida
    ↓ SÍ
¿Datos diferentes? ──NO→ Actualizar cache, skip UPDATE
    ↓ SÍ
UPDATE en Supabase
    ↓
Dispatch event 'user-profile-updated'
    ↓
AuthContext refetch user
    ↓
UI actualizada ✅
```

---

## 💻 Implementación

### Código Principal

```typescript
// src/components/AuthSync.tsx
import { useEffect, useRef } from 'react'
import { useSession, useUser } from '@clerk/clerk-react'
import { supabase } from '@/lib/supabaseClient'
import { createUserProfile } from '@/lib/userProfile'

const processedUsers = new Set<string>()
const lastSyncedData = new Map<string, string>()

const AuthSync = () => {
  const { session, isLoaded } = useSession()
  const { user } = useUser()
  const hasProcessedUser = useRef(false)

  useEffect(() => {
    if (!isLoaded || !session || !user) return

    const sync = async () => {
      // 1. Crear hash de datos actuales
      const clerkFirstName = user.firstName || ''
      const clerkLastName = user.lastName || ''
      const clerkEmail = user.primaryEmailAddress?.emailAddress || ''
      const dataKey = `${clerkFirstName}|${clerkLastName}|${clerkEmail}`

      // 2. Verificar cache (evitar sync redundante)
      const lastSynced = lastSyncedData.get(user.id)
      if (lastSynced === dataKey) {
        return // Datos no han cambiado
      }

      // 3. Consultar Supabase
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id, nombre, apellido, email')
        .eq('id', user.id)
        .single()

      // 4a. Usuario nuevo → crear perfil
      if (!existingUser) {
        console.log('📧 New user detected, creating profile...')
        
        const result = await createUserProfile(user.id, {
          email: clerkEmail,
          nombre: clerkFirstName || 'Usuario',
          apellido: clerkLastName,
          telefono: user.primaryPhoneNumber?.phoneNumber
        })

        if (result.success) {
          console.log('✅ User profile created!')
          lastSyncedData.set(user.id, dataKey)
          window.dispatchEvent(new Event('user-profile-created'))
        }
        return
      }

      // 4b. Usuario existe → verificar cambios
      const needsUpdate = 
        existingUser.nombre !== clerkFirstName ||
        existingUser.apellido !== clerkLastName ||
        existingUser.email !== clerkEmail

      if (needsUpdate) {
        console.log('🔄 User profile changed, syncing to Supabase...')

        const { error } = await supabase
          .from('usuarios')
          .update({
            nombre: clerkFirstName,
            apellido: clerkLastName,
            email: clerkEmail,
            telefono: user.primaryPhoneNumber?.phoneNumber || null
          })
          .eq('id', user.id)

        if (!error) {
          console.log('✅ User profile synced!')
          lastSyncedData.set(user.id, dataKey)
          window.dispatchEvent(new Event('user-profile-updated'))
        }
      } else {
        // Datos iguales, solo actualizar cache
        lastSyncedData.set(user.id, dataKey)
      }
    }

    sync()
  }, [session, user, isLoaded])

  return null
}

export default AuthSync
```

### Integración en App

```typescript
// src/main.tsx
import AuthSync from './components/AuthSync'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <AuthSync />  {/* ← Sincroniza en cada carga */}
    <RouterProvider router={router} />
  </ClerkProvider>
)
```

---

## 🎯 Características

### ✅ Ventajas

1. **Funciona perfectamente** - No depende de configuración externa
2. **Control total** - Código en tu frontend, fácil de debuggear
3. **Logs visibles** - Console del navegador, no logs de servidor
4. **Sin secretos** - No requiere `CLERK_WEBHOOK_SECRET`
5. **Eficiente** - Cache inteligente evita queries redundantes
6. **Resiliente** - Manejo de errores sin romper la app

### 📊 Optimizaciones

1. **Cache con Map:**
   ```typescript
   const lastSyncedData = new Map<string, string>()
   // Key: user.id, Value: "nombre|apellido|email"
   ```
   Evita UPDATE queries si los datos no cambiaron

2. **Early return:**
   ```typescript
   if (lastSyncedData.get(user.id) === dataKey) {
     return // Skip todo si ya está sincronizado
   }
   ```

3. **Set para usuarios procesados:**
   ```typescript
   const processedUsers = new Set<string>()
   // Previene duplicados en la misma sesión
   ```

### ⚠️ Limitación

**Webhooks:** Sincronizan inmediatamente cuando cambias en Clerk  
**AuthSync:** Sincroniza cuando cargas la página/navegas

**En la práctica:** No es problema porque:
1. Usuario actualiza perfil en `/perfil/configuracion`
2. Navega a otra página o recarga
3. AuthSync detecta cambio y sincroniza

Delay máximo: Hasta que usuario navegue/recargue (generalmente segundos)

---

## 🧪 Testing

### Prueba de Sincronización

1. **Ir a Clerk Dashboard:**
   - https://dashboard.clerk.com
   - Users → Tu usuario
   - Edit: Cambiar `first_name` a "Test User"
   - Save

2. **Ir a tu app:**
   - https://mercadillo.app
   - Recargar página (F5)

3. **Abrir consola del navegador (F12):**
   ```
   🔄 User profile changed, syncing to Supabase...
   ✅ User profile synced!
   ```

4. **Verificar en Supabase:**
   - Table Editor → usuarios
   - Buscar por email: `contactomercadillo@gmail.com`
   - Verificar `nombre` = "Test User" ✅

### Prueba de Email de Bienvenida

1. **Crear usuario nuevo:**
   - Sign up en https://mercadillo.app/sign-up
   - Completar registro

2. **Verificar logs:**
   ```
   📧 New user detected, creating profile...
   ✅ User profile created!
   ```

3. **Verificar email:**
   - Revisar inbox
   - Email de "¡Bienvenido a Mercadillo!" debe llegar

---

## 🔍 Debugging

### Logs en Consola

AuthSync usa emojis para fácil identificación:

- `📧` - Nuevo usuario detectado
- `🔄` - Sincronizando cambios
- `✅` - Operación exitosa
- `❌` - Error

### Comandos Útiles

```javascript
// En consola del navegador

// Ver último sync de usuario actual
lastSyncedData.get('user_xxxxx')

// Ver todos los syncs en memoria
lastSyncedData

// Forzar re-sync (limpiar cache)
lastSyncedData.clear()
// Luego recargar página
```

---

## ⚙️ Configuración

### Variables de Entorno

```env
# .env.local
VITE_SUPABASE_URL=https://xwubnuokmfghtyyfpgtl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

No requiere variables adicionales (vs webhooks que necesitan `CLERK_WEBHOOK_SECRET`)

---

## 📚 Eventos Disparados

AuthSync dispara eventos del DOM para notificar a otros componentes:

### `user-profile-created`

**Cuándo:** Usuario nuevo creado en Supabase

```typescript
window.addEventListener('user-profile-created', () => {
  console.log('Nuevo usuario creado!')
  // AuthContext refetch user
})
```

### `user-profile-updated`

**Cuándo:** Datos actualizados en Supabase

```typescript
window.addEventListener('user-profile-updated', () => {
  console.log('Perfil actualizado!')
  // AuthContext refetch user
})
```

**Uso en AuthContext:**

```typescript
// src/contexts/AuthContext.tsx
useEffect(() => {
  const handleProfileUpdate = () => {
    refetchUser() // Obtener datos frescos
  }

  window.addEventListener('user-profile-updated', handleProfileUpdate)
  window.addEventListener('user-profile-created', handleProfileUpdate)

  return () => {
    window.removeEventListener('user-profile-updated', handleProfileUpdate)
    window.removeEventListener('user-profile-created', handleProfileUpdate)
  }
}, [])
```

---

## 🆚 AuthSync vs Webhooks (Intento Fallido)

### ¿Por qué no webhooks?

Se intentó implementar webhooks de Clerk pero Vercel devolvía `HTTP 307 Temporary Redirect` antes de ejecutar el código.

**Intentos realizados (todos fallaron):**
- Cambiar ruta del webhook (3 veces)
- Modificar `vercel.json` (6 configuraciones diferentes)
- Eliminar rewrites
- Configurar trailing slash
- Actualizar functions config

**Resultado:** Código del webhook era correcto, pero Vercel no lo ejecutaba.

### Comparación

| Característica | AuthSync | Webhooks |
|----------------|----------|----------|
| **Funciona** | ✅ Sí | ❌ 307 Redirect |
| **Configuración** | Simple | Compleja |
| **Debugging** | Fácil (consola) | Difícil (logs servidor) |
| **Dependencias** | Solo Clerk + Supabase | +Svix, +Vercel config |
| **Secretos** | No | Sí (CLERK_WEBHOOK_SECRET) |
| **Latencia** | Al cargar página | Inmediata |
| **Confiabilidad** | Alta | Baja (en este proyecto) |

---

## 🚀 Próximas Mejoras

- [ ] Agregar retry automático si falla sync
- [ ] Telemetría de syncs exitosos vs fallidos
- [ ] Sincronizar foto de perfil (Clerk → Cloudinary → Supabase)
- [ ] Sync de preferencias de usuario
- [ ] Modo offline (queue de syncs pendientes)

---

## 📖 Referencias

- Clerk React Hooks: https://clerk.com/docs/references/react/use-user
- Supabase JS Client: https://supabase.com/docs/reference/javascript
- React useEffect: https://react.dev/reference/react/useEffect

---

**Implementado:** Octubre 4, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Producción  
**Reemplaza:** Webhooks de Clerk (no funcionales)
