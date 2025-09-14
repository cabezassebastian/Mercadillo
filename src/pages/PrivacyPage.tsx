import React from 'react'
import { Shield, Eye, Lock, Database, UserCheck } from 'lucide-react'

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-hueso py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amarillo rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-gris-oscuro" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gris-oscuro mb-4">
            Política de Privacidad
          </h1>
          <p className="text-lg text-gris-claro max-w-2xl mx-auto">
            En Mercadillo Lima Perú valoramos tu privacidad y nos comprometemos a 
            proteger tu información personal.
          </p>
        </div>

        {/* Content */}
        <div className="card p-8 space-y-8">
          {/* Sección 1 */}
          <div>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-amarillo mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro">1. Información que Recopilamos</h2>
            </div>
            <div className="text-gray-600 space-y-4">
              <p>
                Recopilamos información que usted nos proporciona directamente, como cuando:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Crea una cuenta en nuestro sitio web</li>
                <li>Realiza una compra o solicita información</li>
                <li>Se suscribe a nuestro boletín informativo</li>
                <li>Participa en encuestas o promociones</li>
                <li>Se comunica con nosotros</li>
              </ul>
              <p>
                Esta información puede incluir: nombre, dirección de correo electrónico, 
                número de teléfono, dirección de envío, información de pago y preferencias de comunicación.
              </p>
            </div>
          </div>

          {/* Sección 2 */}
          <div>
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-amarillo mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro">2. Cómo Utilizamos su Información</h2>
            </div>
            <div className="text-gray-600 space-y-4">
              <p>
                Utilizamos la información que recopilamos para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Procesar y entregar sus pedidos</li>
                <li>Gestionar su cuenta y proporcionar servicio al cliente</li>
                <li>Enviar información sobre productos, servicios y promociones</li>
                <li>Mejorar nuestro sitio web y servicios</li>
                <li>Personalizar su experiencia de compra</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </div>
          </div>

          {/* Sección 3 */}
          <div>
            <div className="flex items-center mb-4">
              <UserCheck className="w-6 h-6 text-amarillo mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro">3. Compartir Información</h2>
            </div>
            <div className="text-gray-600 space-y-4">
              <p>
                No vendemos, comercializamos o transferimos su información personal a terceros, 
                excepto en las siguientes circunstancias:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Con proveedores de servicios que nos ayudan a operar nuestro negocio</li>
                <li>Para cumplir con la ley o responder a procesos legales</li>
                <li>Para proteger nuestros derechos, propiedad o seguridad</li>
                <li>Con su consentimiento explícito</li>
              </ul>
            </div>
          </div>

          {/* Sección 4 */}
          <div>
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-amarillo mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro">4. Seguridad de los Datos</h2>
            </div>
            <div className="text-gray-600 space-y-4">
              <p>
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para 
                proteger su información personal contra:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acceso no autorizado</li>
                <li>Alteración, divulgación o destrucción</li>
                <li>Procesamiento ilegal</li>
                <li>Pérdida accidental</li>
              </ul>
              <p>
                Utilizamos encriptación SSL para proteger la información sensible durante la transmisión 
                y almacenamos datos en servidores seguros con acceso restringido.
              </p>
            </div>
          </div>

          {/* Sección 5 */}
          <div>
            <h2 className="text-2xl font-bold text-gris-oscuro mb-4">5. Sus Derechos</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acceder a su información personal que tenemos</li>
                <li>Corregir información inexacta o incompleta</li>
                <li>Solicitar la eliminación de su información personal</li>
                <li>Oponerse al procesamiento de su información</li>
                <li>Solicitar la portabilidad de sus datos</li>
                <li>Retirar su consentimiento en cualquier momento</li>
              </ul>
              <p>
                Para ejercer estos derechos, contáctenos en contactomercadillo@gmail.com
              </p>
            </div>
          </div>

          {/* Sección 6 */}
          <div>
            <h2 className="text-2xl font-bold text-gris-oscuro mb-4">6. Cookies y Tecnologías Similares</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Recordar sus preferencias y configuraciones</li>
                <li>Analizar el tráfico y uso del sitio web</li>
                <li>Personalizar contenido y anuncios</li>
                <li>Proporcionar funciones de redes sociales</li>
              </ul>
              <p>
                Puede controlar las cookies a través de la configuración de su navegador.
              </p>
            </div>
          </div>

          {/* Sección 7 */}
          <div>
            <h2 className="text-2xl font-bold text-gris-oscuro mb-4">7. Retención de Datos</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Conservamos su información personal solo mientras sea necesario para cumplir 
                con los fines para los cuales fue recopilada, incluidos los requisitos legales, 
                contables o de informes.
              </p>
            </div>
          </div>

          {/* Sección 8 */}
          <div>
            <h2 className="text-2xl font-bold text-gris-oscuro mb-4">8. Cambios a esta Política</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos 
                sobre cualquier cambio publicando la nueva Política de Privacidad en esta página 
                y actualizando la fecha de "última actualización".
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gris-claro">
              <strong>Última actualización:</strong> Enero 2024
            </p>
            <p className="text-sm text-gris-claro mt-2">
              Si tiene alguna pregunta sobre esta Política de Privacidad, 
              póngase en contacto con nosotros en contactomercadillo@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
