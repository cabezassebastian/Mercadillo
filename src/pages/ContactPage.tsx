import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react'
import emailjs from '@emailjs/browser'

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Verificar que las variables de entorno estén configuradas
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID

      if (!publicKey || !serviceId || !templateId) {
        throw new Error('Variables de entorno de EmailJS no configuradas')
      }

      // Enviar email usando EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          asunto: formData.asunto,
          mensaje: formData.mensaje,
          to_email: 'contactomercadillo@gmail.com' // Email de destino
        },
        publicKey
      )
      
      setSubmitStatus('success')
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      })
    } catch (error) {
      console.error('Error enviando email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amarillo dark:bg-yellow-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gris-oscuro dark:text-gray-900" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Contáctanos
          </h1>
          <p className="text-lg text-gris-claro dark:text-gray-400 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti. 
            Contáctanos y te responderemos lo antes posible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="space-y-8">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb-6">Información de Contacto</h2>
              
              <div className="space-y-6">
                {/* Teléfono */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amarillo dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-gris-oscuro dark:text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-1">Teléfono</h3>
                    <p className="text-gray-600 dark:text-gray-400">+51 977 933 410</p>
                    <p className="text-sm text-gris-claro dark:text-gray-500">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gris-claro dark:text-gray-500">Sábados: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amarillo dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-gris-oscuro dark:text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-1">Correo Electrónico</h3>
                    <p className="text-gray-600 dark:text-gray-400">contactomercadillo@gmail.com</p>
                    <p className="text-sm text-gris-claro dark:text-gray-500">Respuesta en 24-48 horas</p>
                  </div>
                </div>

                {/* Dirección */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amarillo dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-gris-oscuro dark:text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-1">Dirección</h3>
                    <p className="text-gray-600 dark:text-gray-400">El Agustino</p>
                    <p className="text-gray-600 dark:text-gray-400">Lima Este 15007</p>
                    <p className="text-gray-600 dark:text-gray-400">Perú</p>
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amarillo dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-gris-oscuro dark:text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-1">Horarios de Atención</h3>
                    <div className="text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                      <p>Sábados: 9:00 AM - 2:00 PM</p>
                      <p>Domingos: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preguntas frecuentes */}
            <div className="card p-8">
              <h3 className="text-xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">Preguntas Frecuentes</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gris-oscuro dark:text-gray-100 mb-1">¿Cuánto tiempo tarda mi pedido?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Los envíos en El Agustino, Santa Anita y SJL tardan 24 horas, Lima Metropolitana 24-48 horas, y a provincias de 3-7 días hábiles.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gris-oscuro dark:text-gray-100 mb-1">¿Puedo cambiar mi pedido?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Puedes modificar tu pedido antes de que sea despachado. Contáctanos inmediatamente.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gris-oscuro dark:text-gray-100 mb-1">¿Aceptan devoluciones?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sí, aceptamos devoluciones hasta 30 días después de la compra. Ver nuestra política de devoluciones.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb-6">Envíanos un Mensaje</h2>
            
            {submitStatus === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p className="text-green-800 dark:text-green-200">
                  ¡Gracias! Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200">
                  Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="+51 999 999 999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Asunto *
                  </label>
                  <select
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="consulta-producto">Consulta sobre producto</option>
                    <option value="estado-pedido">Estado de mi pedido</option>
                    <option value="devolucion">Devolución o cambio</option>
                    <option value="facturacion">Facturación</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                  Mensaje *
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="input-field"
                  placeholder="Describe tu consulta o mensaje..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gris-oscuro dark:border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
