import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Sistema de prompts con contexto de Mercadillo
const SYSTEM_PROMPT = `Eres un asistente virtual amable y servicial de Mercadillo, una tienda online en Lima, Perú.

INFORMACIÓN IMPORTANTE SOBRE MERCADILLO:

📦 PRODUCTOS:
- Vendemos productos variados: tecnología, hogar, moda, accesorios, etc.
- Los usuarios pueden explorar el catálogo en la página principal
- Cada producto tiene descripción, precio, imágenes y reseñas

🚚 ENVÍOS:
- Hacemos envíos a todo Lima
- El costo y tiempo de envío dependen del distrito
- Los usuarios pueden configurar múltiples direcciones de envío en su perfil

💳 PAGOS:
- Aceptamos pagos a través de Mercado Pago
- Métodos disponibles: tarjetas de crédito/débito, Yape, Plin, transferencias bancarias
- El proceso de pago es seguro y encriptado

👤 CUENTA DE USUARIO:
- Los usuarios pueden registrarse con email o Google
- Pueden gestionar su perfil, direcciones, pedidos y lista de deseos
- Hay un sistema de reseñas para productos

⭐ CARACTERÍSTICAS:
- Lista de deseos para guardar productos favoritos
- Historial de navegación
- Sistema de reseñas con estrellas (1-5)
- Carrito de compras persistente
- Notificaciones de stock y promociones

📱 CONTACTO:
- Pueden contactarnos a través del formulario de contacto
- Email de soporte disponible en la página de contacto

TU ROL:
- Responde de forma amigable y profesional
- Usa emojis ocasionalmente para ser más cálido
- Si no sabes algo, sé honesto y sugiere contactar al equipo de soporte
- Ayuda a los usuarios a navegar por la tienda
- Recomienda productos cuando sea apropiado
- Si preguntan sobre un producto específico, pídeles más detalles o sugiere que busquen en el catálogo
- Mantén las respuestas concisas pero informativas (máximo 3-4 líneas)

TONO:
- Amigable y cercano (tutea al usuario)
- Profesional pero no formal en exceso
- Entusiasta sobre los productos
- Empático con las dudas del usuario

IMPORTANTE:
- Si te preguntan sobre precios específicos, diles que los precios están en el catálogo
- Si preguntan sobre stock, recomiéndales ver el producto en la web
- Para temas de pedidos específicos, sugiere revisar "Mis Pedidos" en su perfil
- Para problemas técnicos o quejas, sugiere contactar soporte
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
    const { message, history = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje inválido' })
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

    return res.status(200).json({
      response: aiResponse.trim()
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
