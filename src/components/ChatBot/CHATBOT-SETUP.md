# 🤖 Chatbot con Google Gemini AI

## Descripción

Chatbot inteligente integrado en Mercadillo que usa Google Gemini AI para responder preguntas de los usuarios sobre productos, envíos, pagos y más.

## ✨ Características

- 💬 **Respuestas inteligentes** con contexto sobre Mercadillo
- 📱 **100% responsive** (móvil y desktop)
- 🌙 **Dark mode** incluido
- 💾 **Historial persistente** en localStorage
- 🎨 **Diseño consistente** con la marca Mercadillo
- ⚡ **Gratis** hasta 86,400 mensajes/día
- 🔄 **Auto-scroll** a nuevos mensajes
- ⌨️ **Enter para enviar** mensajes

## 🚀 Configuración

### 1. Obtener API Key de Google Gemini (GRATIS)

1. **Ve a Google AI Studio:**
   - Visita: https://makersuite.google.com/app/apikey
   - O busca "Google AI Studio" en Google

2. **Inicia sesión con tu cuenta de Google**

3. **Crear API Key:**
   - Click en **"Get API key"** o **"Create API key"**
   - Selecciona **"Create API key in new project"** (si es tu primera vez)
   - O selecciona un proyecto existente de Google Cloud
   - Click en **"Create API key"**

4. **Copiar la API Key:**
   - Se mostrará tu API key (empieza con `AIza...`)
   - **¡IMPORTANTE!** Cópiala y guárdala en un lugar seguro
   - No podrás verla de nuevo

### 2. Configurar en tu proyecto

1. **Crear archivo `.env.local`:**
   ```bash
   # En la raíz del proyecto
   cp env.local.example .env.local
   ```

2. **Agregar tu API key:**
   ```env
   # En .env.local
   GEMINI_API_KEY=AIzaSy...tu_api_key_aqui
   ```

3. **Reiniciar el servidor de desarrollo:**
   ```bash
   # Ctrl+C para detener
   pnpm dev
   ```

### 3. Verificar que funciona

1. Abre tu aplicación en el navegador
2. Busca el botón flotante amarillo en la esquina inferior derecha
3. Click para abrir el chat
4. Escribe un mensaje de prueba: "Hola"
5. El bot debería responder en unos segundos

## 📊 Límites del Plan Gratuito

- **60 requests por minuto**
- **86,400 requests por día** (suficiente para miles de usuarios)
- **Gratis para siempre** (no caduca)
- Se reinicia automáticamente cada minuto/día

## 🎯 Capacidades del Bot

El chatbot está entrenado para responder sobre:

- 📦 **Productos**: Información general sobre el catálogo
- 🚚 **Envíos**: Zonas de cobertura, costos y tiempos
- 💳 **Pagos**: Métodos disponibles (Mercado Pago, Yape, etc.)
- 👤 **Cuenta**: Registro, perfil, direcciones
- ⭐ **Reseñas**: Sistema de calificaciones
- 🛒 **Carrito**: Proceso de compra
- ❤️ **Lista de deseos**: Cómo guardar favoritos
- 📱 **Contacto**: Formas de contactar soporte

## 🛠️ Personalización

### Modificar el contexto del bot

Edita el archivo `api/chat.ts` y actualiza la constante `SYSTEM_PROMPT`:

```typescript
const SYSTEM_PROMPT = `
Eres un asistente virtual de Mercadillo...
[Agrega tu contexto personalizado aquí]
`
```

### Cambiar el estilo visual

Los componentes del chat están en:
- `src/components/ChatBot/ChatWidget.tsx` - Widget principal
- `src/components/ChatBot/ChatMessage.tsx` - Mensajes individuales

### Ajustar parámetros de IA

En `api/chat.ts`, sección `generationConfig`:

```typescript
generationConfig: {
  temperature: 0.7,  // Creatividad (0-1, más alto = más creativo)
  topK: 40,          // Diversidad de tokens
  topP: 0.95,        // Probabilidad acumulada
  maxOutputTokens: 1024, // Longitud máxima de respuesta
}
```

## 🐛 Solución de Problemas

### El bot no responde

1. **Verifica la API key:**
   ```bash
   # En tu terminal
   echo $GEMINI_API_KEY  # Linux/Mac
   # O
   echo %GEMINI_API_KEY%  # Windows
   ```

2. **Revisa la consola del navegador:**
   - F12 → Console
   - Busca errores en rojo

3. **Verifica los logs del servidor:**
   - Vercel: Dashboard → tu proyecto → Functions → Logs
   - Local: terminal donde corre `pnpm dev`

### Error "Rate limit exceeded"

- Espera 1 minuto y vuelve a intentar
- Es normal si haces muchas pruebas seguidas
- En producción es muy raro que pase

### El bot responde cosas incorrectas

- Actualiza el `SYSTEM_PROMPT` en `api/chat.ts`
- Agrega más contexto específico sobre tu negocio
- Ajusta la `temperature` (0.5 = más conservador, 0.9 = más creativo)

## 📈 Mejoras Futuras

Ideas para expandir el chatbot:

- [ ] Guardar conversaciones en Supabase
- [ ] Analytics de preguntas frecuentes
- [ ] Integración con catálogo de productos real
- [ ] Búsqueda de productos desde el chat
- [ ] Transfer a soporte humano
- [ ] Notificaciones de mensajes no leídos
- [ ] Widget minimizado con preview del último mensaje

## 📚 Recursos

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Límites y cuotas](https://ai.google.dev/pricing)
- [Ejemplos de prompts](https://ai.google.dev/docs/prompting_intro)

## 🔒 Seguridad

- ✅ La API key está en el servidor (no expuesta al frontend)
- ✅ Rate limiting incluido
- ✅ Filtros de contenido inapropiado activados
- ✅ Validación de inputs

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo.
