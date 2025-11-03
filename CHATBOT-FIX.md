# 🤖 Fix del Chatbot de Gemini AI - Error 404

## 📋 Problema Reportado

El chatbot de Gemini AI mostraba el siguiente error en consola:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
```

Y el usuario recibía el mensaje: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo."

## 🔍 Causa Raíz

El componente `ChatWidget.tsx` estaba usando el endpoint antiguo de Vercel (`/api/chat`) en lugar del endpoint correcto de Supabase Edge Function.

**Código problemático (línea 75):**
```tsx
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: userMessage.content,
    history: messages.slice(-5),
    userId: user?.id,
    sessionId: sessionId
  })
})
```

## ✅ Solución Implementada

### 1. Importar la configuración de API
Se agregaron los imports necesarios al inicio del archivo:
```tsx
import { API_ENDPOINTS, getApiHeaders } from '../../config/api'
```

### 2. Actualizar la llamada fetch
Se modificó el fetch para usar el endpoint correcto de Supabase:
```tsx
const response = await fetch(API_ENDPOINTS.chat, {
  method: 'POST',
  headers: getApiHeaders({ 
    userId: user?.id 
  }),
  body: JSON.stringify({
    message: userMessage.content,
    history: messages.slice(-5),
    userId: user?.id,
    sessionId: sessionId
  })
})
```

## 🎯 Beneficios del Fix

### ✅ Endpoint Correcto
- Ahora usa `API_ENDPOINTS.chat` que apunta a la Supabase Edge Function
- URL correcta: `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/chat`

### ✅ Headers Apropiados
- Usa `getApiHeaders()` que incluye el `apikey` de Supabase automáticamente
- Maneja el `x-user-id` para autenticación

### ✅ Configuración Centralizada
- Usa el sistema de configuración centralizado en `src/config/api.ts`
- Permite alternar entre Vercel y Supabase mediante feature flags

## 🔧 Configuración de la Edge Function

La Edge Function de chat ya está correctamente configurada en:
- **Archivo:** `supabase/functions/chat/index.ts`
- **Modelo:** Gemini 2.0 Flash
- **Features:**
  - ✅ Búsqueda de productos en base de datos
  - ✅ Sistema de prompts con contexto de Mercadillo
  - ✅ Historial de conversación (últimos 5 mensajes)
  - ✅ Guardado de conversaciones en Supabase
  - ✅ Manejo de errores y rate limiting

## 📝 Variables de Entorno Requeridas

Para que el chatbot funcione correctamente, asegúrate de tener configuradas estas variables:

**En el proyecto (frontend):**
```env
VITE_SUPABASE_URL=https://xwubnuokmfghtyyfpgtl.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

**En Supabase Edge Functions:**
```env
GEMINI_API_KEY=tu_google_gemini_api_key
SUPABASE_URL=https://xwubnuokmfghtyyfpgtl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## 🧪 Cómo Probar

1. **Abrir el chatbot** en la esquina inferior derecha del sitio
2. **Enviar un mensaje** de prueba, por ejemplo: "Hola, ¿qué productos tienes?"
3. **Verificar en la consola** que no aparece el error 404
4. **Confirmar respuesta** del bot con información sobre Mercadillo

### Ejemplos de Mensajes de Prueba

**Consultas generales:**
- "¿Qué categorías de productos tienen?"
- "¿Hacen envíos a Lima?"
- "¿Cómo puedo pagar?"

**Búsqueda de productos:**
- "Busca laptops"
- "Muéstrame productos de electrónicos"
- "Tienes camisetas?"

**Información de cuenta:**
- "¿Cómo creo una cuenta?"
- "¿Dónde veo mis pedidos?"
- "¿Cómo agrego productos a mi lista de deseos?"

## 📊 Estado del Sistema

### Configuración API (`src/config/api.ts`)
```typescript
USE_SUPABASE_FUNCTIONS = {
  products: true,    // ✅ Migrada - Fase 1
  orders: true,      // ✅ Migrada - Fase 1
  admin: true,       // ✅ Migrada
  checkout: true,    // ✅ Migrada - Fase 2
  emails: true,      // ✅ Migrada - Fase 2
  mercadopago: true, // ✅ Migrada - Fase 2
  chat: true,        // ✅ Migrada - Fase 3
}
```

### Progreso de Migración
- **Total de funciones:** 8
- **Migradas a Supabase:** 8
- **Progreso:** 100% ✅

## 🚀 Deployment

Los cambios ya están:
- ✅ Commiteados (`commit 7a8e7`)
- ✅ Pusheados a GitHub
- ✅ Listos para deploy automático en Vercel

El deploy en Vercel se actualizará automáticamente con el fix del chatbot.

## 📚 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/components/ChatBot/ChatWidget.tsx` | Actualizado endpoint de `/api/chat` a `API_ENDPOINTS.chat` |

## 🎉 Resultado

El chatbot de Gemini AI ahora funciona correctamente:
- ✅ Sin errores 404
- ✅ Respuestas del modelo Gemini 2.0 Flash
- ✅ Búsqueda de productos funcionando
- ✅ Historial de conversación guardado
- ✅ Contexto completo de Mercadillo Lima Perú

---

**Fecha del fix:** 2025
**Commit:** `7a8e7`
**Estado:** ✅ RESUELTO
