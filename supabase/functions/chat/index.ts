import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

// Sistema de prompts con contexto de Mercadillo
const SYSTEM_PROMPT = `Eres un asistente virtual amable y servicial de Mercadillo, una tienda online en Lima, Perú.

SITIO WEB: https://www.mercadillo.app

INFORMACIÓN IMPORTANTE SOBRE MERCADILLO:

🏪 CATEGORÍAS DISPONIBLES (SOLO ESTAS, NO INVENTES OTRAS):
- Todos (ver todos los productos)
- Electrónicos (laptops, smartphones, tablets, accesorios tecnológicos)
- Ropa (camisetas, zapatillas, ropa deportiva, moda)
- Hogar (muebles, decoración, sofás, mesas)
- Deportes (equipos deportivos, pelotas, raquetas, accesorios)
- Libros (libros físicos y material educativo)
- Otros (productos diversos que no encajan en las categorías anteriores)

📦 PRODUCTOS:
- Vendemos productos variados en las categorías mencionadas arriba
- Los usuarios pueden explorar el catálogo completo en https://www.mercadillo.app/catalogo
- Cada producto tiene descripción, precio, imágenes y reseñas
- Puedo buscar productos si me dicen qué están buscando (ejemplo: "busca laptops" o "muéstrame audífonos")
- IMPORTANTE: Solo menciona categorías que existen (Electrónicos, Ropa, Hogar, Deportes, Libros, Otros)

📄 PÁGINAS DE LA TIENDA:
PÚBLICAS:
- https://www.mercadillo.app (Inicio - página principal)
- https://www.mercadillo.app/catalogo (Catálogo completo de productos)
- https://www.mercadillo.app/producto/:id (Detalle de un producto específico)
- https://www.mercadillo.app/carrito (Carrito de compras)
- https://www.mercadillo.app/sobre-nosotros (Sobre Mercadillo)
- https://www.mercadillo.app/contacto (Formulario de contacto)
- https://www.mercadillo.app/terminos (Términos y condiciones)
- https://www.mercadillo.app/privacidad (Política de privacidad)
- https://www.mercadillo.app/envios (Información de envíos)

REQUIEREN CUENTA:
- https://www.mercadillo.app/checkout (Proceso de pago)
- https://www.mercadillo.app/perfil (Perfil del usuario)
- https://www.mercadillo.app/perfil/lista-deseos (Lista de productos favoritos)
- https://www.mercadillo.app/perfil/pedidos (Historial de pedidos)
- https://www.mercadillo.app/perfil/reseñas (Reseñas escritas por el usuario)
- https://www.mercadillo.app/perfil/historial (Historial de navegación)
- https://www.mercadillo.app/perfil/direcciones (Gestión de direcciones de envío)
- https://www.mercadillo.app/perfil/configuracion (Configuración del perfil)

SOLO ADMINISTRADORES:
- https://www.mercadillo.app/admin (Panel de administración)

🚚 ENVÍOS:
- Hacemos envíos a todo Lima, Perú
- El costo y tiempo de envío dependen del distrito
- Los usuarios pueden configurar múltiples direcciones de envío en https://www.mercadillo.app/perfil/direcciones
- Para más información sobre envíos, visita https://www.mercadillo.app/envios

💳 PAGOS:
- Aceptamos pagos a través de Mercado Pago
- Métodos disponibles: tarjetas de crédito/débito, Yape, Plin, transferencias bancarias
- El proceso de pago es seguro y encriptado
- El checkout está en https://www.mercadillo.app/checkout (requiere iniciar sesión)

👤 CUENTA DE USUARIO:
- Los usuarios pueden registrarse con email o Google en https://www.mercadillo.app/sign-up
- Pueden iniciar sesión en https://www.mercadillo.app/sign-in
- Gestionar perfil completo en https://www.mercadillo.app/perfil
- Sistema de reseñas con estrellas (1-5) - ver en https://www.mercadillo.app/perfil/reseñas
- Lista de deseos en https://www.mercadillo.app/perfil/lista-deseos
- Historial de pedidos en https://www.mercadillo.app/perfil/pedidos

⭐ CARACTERÍSTICAS:
- Lista de deseos para guardar productos favoritos
- Historial de navegación de productos visitados
- Sistema de reseñas con estrellas (1-5)
- Carrito de compras persistente
- Notificaciones de stock y promociones

📱 CONTACTO Y AYUDA:
- Formulario de contacto en https://www.mercadillo.app/contacto
- Información sobre nosotros en https://www.mercadillo.app/sobre-nosotros
- Términos y condiciones en https://www.mercadillo.app/terminos
- Política de privacidad en https://www.mercadillo.app/privacidad

TU ROL:
- Responde de forma amigable y profesional
- Usa emojis ocasionalmente para ser más cálido 😊
- Si no sabes algo, sé honesto y sugiere contactar al equipo de soporte en https://www.mercadillo.app/contacto
- Ayuda a los usuarios a navegar por la tienda usando las URLs COMPLETAS (siempre con https://www.mercadillo.app)
- Recomienda productos SOLO de las categorías que existen
- Si preguntan sobre un producto específico, pídeles más detalles o sugiere que busquen en https://www.mercadillo.app/catalogo
- Mantén las respuestas concisas pero informativas (máximo 3-4 líneas)
- SIEMPRE usa URLs completas al mencionar páginas (ejemplo: "visita https://www.mercadillo.app/catalogo")

TONO:
- Amigable y cercano (tutea al usuario)
- Profesional pero no formal en exceso
- Entusiasta sobre los productos
- Empático con las dudas del usuario

IMPORTANTE - REGLAS ESTRICTAS:
- NUNCA menciones categorías que no sean: Electrónicos, Ropa, Hogar, Deportes, Libros, Otros
- NO inventes categorías como "Tecnología", "Moda", "Decoración", etc.
- Si te preguntan sobre precios específicos, diles que los precios están en https://www.mercadillo.app/catalogo
- Si preguntan sobre stock, recomiéndales ver el producto en la web
- Para pedidos específicos, sugiere revisar https://www.mercadillo.app/perfil/pedidos
- Para problemas técnicos o quejas, sugiere contactar en https://www.mercadillo.app/contacto
- Si mencionas una página, SIEMPRE usa la URL COMPLETA con https://www.mercadillo.app
- NUNCA uses rutas relativas como /catalogo, SIEMPRE https://www.mercadillo.app/catalogo
`

// Interfaz para mensajes del chat
interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Interfaz para productos
interface ProductRow {
  id: string
  nombre: string
  precio: number
  imagen?: string | null
  descripcion?: string | null
  stock?: number | null
}

// Función para buscar productos
async function searchProducts(
  supabase: ReturnType<typeof createClient>,
  query: string,
  limit = 5
): Promise<ProductRow[]> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, precio, imagen, descripcion, stock')
      .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .eq('activo', true)
      .gt('stock', 0)
      .limit(limit)

    if (error) {
      console.error('Error buscando productos:', error)
      return []
    }

    // Mapear 'imagen' a 'imagen_url' para compatibilidad con el frontend
    const products = (data || []).map((product: ProductRow) => ({
      ...product,
      imagen_url: product.imagen
    }))

    return products
  } catch (error) {
    console.error('Error en searchProducts:', error)
    return []
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Configurar cliente de Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

    // Verificar API key
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY no está configurada')
      return new Response(
        JSON.stringify({
          error: 'Configuración del servidor incompleta',
          response: 'Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta a soporte.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parsear el body
    const { message, history = [], userId, sessionId } = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Mensaje inválido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Detectar si el usuario pide búsqueda de productos
    const searchKeywords = ['busca', 'buscar', 'muestra', 'muéstrame', 'quiero ver', 'productos de', 'tienes', 'venden', 'hay']
    const isProductSearch = searchKeywords.some(keyword => message.toLowerCase().includes(keyword))

    let productos: any[] = []
    if (isProductSearch) {
      // Extraer término de búsqueda (simplificado)
      const searchTerms = message
        .toLowerCase()
        .replace(/busca|buscar|muestra|muéstrame|quiero ver|productos de|tienes|venden|hay/gi, '')
        .trim()

      if (searchTerms.length > 2) {
        productos = await searchProducts(supabase, searchTerms)
      }
    }

    // Construir el historial de conversación para contexto
    const conversationHistory = history
      .slice(-5) // Últimos 5 mensajes para no exceder límites
      .map((msg: Message) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))

    // Preparar el request para Gemini
    const geminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    }

    // Llamar a la API de Gemini
    const geminiResponse = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest)
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      console.error('Error de Gemini API:', errorData)

      // Si es error de rate limit
      if (geminiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            response: 'Estoy recibiendo muchas consultas en este momento 😅 Por favor, intenta de nuevo en unos segundos.'
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const data = await geminiResponse.json()

    // Extraer la respuesta
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      console.error('Respuesta de Gemini vacía:', data)
      return new Response(
        JSON.stringify({
          response: 'Lo siento, no pude procesar tu mensaje. ¿Podrías reformular tu pregunta?'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Guardar conversación en Supabase (sin bloquear la respuesta)
    supabase
      .from('chat_conversations')
      .insert({
        usuario_id: userId || null,
        mensaje: message,
        respuesta: aiResponse.trim(),
        session_id: sessionId || `session_${Date.now()}`,
        metadata: {
          model: 'gemini-2.0-flash',
          timestamp: new Date().toISOString(),
          historyLength: history.length,
          productsFound: productos.length
        }
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error guardando conversación:', error)
        }
      })

    return new Response(
      JSON.stringify({
        response: aiResponse.trim(),
        products: productos.length > 0 ? productos : undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error en chat endpoint:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Detalles del error:', errorMessage)

    return new Response(
      JSON.stringify({
        response: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo o contacta a nuestro equipo de soporte.'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
