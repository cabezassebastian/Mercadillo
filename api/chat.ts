import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Inicializar Supabase (usar variables sin prefijo VITE_ para backend)
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Función para buscar productos
async function searchProducts(query: string, limit = 5) {
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
    const products = (data || []).map(product => ({
      ...product,
      imagen_url: product.imagen
    }))

    return products
  } catch (error) {
    console.error('Error en searchProducts:', error)
    return []
  }
}

// Sistema de prompts con contexto de Mercadillo
const SYSTEM_PROMPT = `Eres un asistente virtual amable y servicial de Mercadillo, una tienda online en Lima, Perú.

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
- Los usuarios pueden explorar el catálogo completo en /catalogo
- Cada producto tiene descripción, precio, imágenes y reseñas
- Puedo buscar productos si me dicen qué están buscando (ejemplo: "busca laptops" o "muéstrame audífonos")
- IMPORTANTE: Solo menciona categorías que existen (Electrónicos, Ropa, Hogar, Deportes, Libros, Otros)

📄 PÁGINAS DE LA TIENDA:
PÚBLICAS:
- / (Inicio - página principal)
- /catalogo (Catálogo completo de productos)
- /producto/:id (Detalle de un producto específico)
- /carrito (Carrito de compras)
- /sobre-nosotros (Sobre Mercadillo)
- /contacto (Formulario de contacto)
- /terminos (Términos y condiciones)
- /privacidad (Política de privacidad)
- /envios (Información de envíos)

REQUIEREN CUENTA:
- /checkout (Proceso de pago)
- /perfil (Perfil del usuario)
- /perfil/lista-deseos (Lista de productos favoritos)
- /perfil/pedidos (Historial de pedidos)
- /perfil/reseñas (Reseñas escritas por el usuario)
- /perfil/historial (Historial de navegación)
- /perfil/direcciones (Gestión de direcciones de envío)
- /perfil/configuracion (Configuración del perfil)

SOLO ADMINISTRADORES:
- /admin (Panel de administración)

🚚 ENVÍOS:
- Hacemos envíos a todo Lima, Perú
- El costo y tiempo de envío dependen del distrito
- Los usuarios pueden configurar múltiples direcciones de envío en /perfil/direcciones
- Para más información sobre envíos, visita /envios

💳 PAGOS:
- Aceptamos pagos a través de Mercado Pago
- Métodos disponibles: tarjetas de crédito/débito, Yape, Plin, transferencias bancarias
- El proceso de pago es seguro y encriptado
- El checkout está en /checkout (requiere iniciar sesión)

👤 CUENTA DE USUARIO:
- Los usuarios pueden registrarse con email o Google en /sign-up
- Pueden iniciar sesión en /sign-in
- Gestionar perfil completo en /perfil
- Sistema de reseñas con estrellas (1-5) - ver en /perfil/reseñas
- Lista de deseos en /perfil/lista-deseos
- Historial de pedidos en /perfil/pedidos

⭐ CARACTERÍSTICAS:
- Lista de deseos para guardar productos favoritos
- Historial de navegación de productos visitados
- Sistema de reseñas con estrellas (1-5)
- Carrito de compras persistente
- Notificaciones de stock y promociones

📱 CONTACTO Y AYUDA:
- Formulario de contacto en /contacto
- Información sobre nosotros en /sobre-nosotros
- Términos y condiciones en /terminos
- Política de privacidad en /privacidad

TU ROL:
- Responde de forma amigable y profesional
- Usa emojis ocasionalmente para ser más cálido 😊
- Si no sabes algo, sé honesto y sugiere contactar al equipo de soporte en /contacto
- Ayuda a los usuarios a navegar por la tienda usando las rutas exactas
- Recomienda productos SOLO de las categorías que existen
- Si preguntan sobre un producto específico, pídeles más detalles o sugiere que busquen en /catalogo
- Mantén las respuestas concisas pero informativas (máximo 3-4 líneas)
- Cuando menciones páginas, usa las rutas exactas (ejemplo: "visita /catalogo")

TONO:
- Amigable y cercano (tutea al usuario)
- Profesional pero no formal en exceso
- Entusiasta sobre los productos
- Empático con las dudas del usuario

IMPORTANTE - REGLAS ESTRICTAS:
- NUNCA menciones categorías que no sean: Electrónicos, Ropa, Hogar, Deportes, Libros, Otros
- NO inventes categorías como "Tecnología", "Moda", "Decoración", etc.
- Si te preguntan sobre precios específicos, diles que los precios están en /catalogo
- Si preguntan sobre stock, recomiéndales ver el producto en la web
- Para pedidos específicos, sugiere revisar /perfil/pedidos
- Para problemas técnicos o quejas, sugiere contactar en /contacto
- Si mencionas una página, SIEMPRE usa la ruta exacta (ej: /catalogo, /perfil/lista-deseos)
`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verificar API key
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY no está configurada')
    return res.status(500).json({ 
      error: 'Configuración del servidor incompleta',
      response: 'Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta a soporte.' 
    })
  }

  try {
    const { message, history = [], userId, sessionId } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje inválido' })
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
        productos = await searchProducts(searchTerms)
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
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
        return res.status(200).json({
          response: 'Estoy recibiendo muchas consultas en este momento 😅 Por favor, intenta de nuevo en unos segundos.'
        })
      }
      
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const data = await geminiResponse.json()
    
    // Extraer la respuesta
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      console.error('Respuesta de Gemini vacía:', data)
      return res.status(200).json({
        response: 'Lo siento, no pude procesar tu mensaje. ¿Podrías reformular tu pregunta?'
      })
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

    return res.status(200).json({
      response: aiResponse.trim(),
      products: productos.length > 0 ? productos : undefined
    })

  } catch (error) {
    console.error('Error en chat endpoint:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Detalles del error:', errorMessage)
    
    return res.status(200).json({
      response: `Lo siento, hubo un problema al procesar tu mensaje. ${process.env.NODE_ENV === 'development' ? `Error: ${errorMessage}` : 'Por favor, intenta de nuevo o contacta a nuestro equipo de soporte.'}`
    })
  }
}
