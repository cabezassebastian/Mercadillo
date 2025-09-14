import React from 'react'
import { FileText, Shield, User, CreditCard } from 'lucide-react'

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-hueso py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amarillo rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gris-oscuro" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gris-oscuro mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-gris-claro max-w-2xl mx-auto">
            Al utilizar nuestros servicios, aceptas estos términos y condiciones. 
            Por favor, léelos cuidadosamente.
          </p>
        </div>

        {/* Content */}
        <div className="card p-8 space-y-8">
          {/* Sección 1 */}
          <div>
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-amarillo mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro">1. Aceptación de los Términos</h2>
            </div>
            <div className="text-gray-600 space-y-4">
              <p>
                Al acceder y utilizar Mercadillo Lima Perú, usted acepta estar sujeto a estos términos 
                y condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es 
                responsable del cumplimiento de las leyes locales aplicables.
              </p>
              <p>
                Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder 
                a este sitio web.
              </p>
            </div>
          </div>

          {/* Sección 2 */}
          <div>
            <div className="flex items-center mb-4">
              <CreditCard className="w-6 h-6 text-amarillo mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro">2. Uso del Sitio Web</h2>
            </div>
            <div className="text-gray-600 space-y-4">
              <p>
                Usted puede usar nuestro sitio web para fines legales únicamente. No puede usar 
                el sitio web:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Para fines comerciales no autorizados</li>
                <li>Para dañar o intentar dañar menores de cualquier manera</li>
                <li>Para transmitir o procurar el envío de publicidad o material promocional no solicitado</li>
                <li>Para hacerse pasar por otra persona o entidad</li>
                <li>Para cargar contenido que contenga virus, código malicioso o similar</li>
              </ul>
            </div>
          </div>

          {/* Sección 3 */}
          <div>
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-amarillo mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro">3. Productos y Servicios</h2>
            </div>
            <div className="text-gray-600 space-y-4">
              <p>
                Mercadillo Lima Perú se reserva el derecho de rechazar el servicio, terminar cuentas, 
                eliminar o editar contenido, o cancelar pedidos a su sola discreción.
              </p>
              <p>
                Los precios de nuestros productos están sujetos a cambios sin previo aviso. 
                Nos reservamos el derecho de modificar o descontinuar el servicio (o cualquier 
                parte o contenido del mismo) sin previo aviso en cualquier momento.
              </p>
            </div>
          </div>

          {/* Sección 4 */}
          <div>
            <h2 className="text-2xl font-bold text-gris-oscuro mb-4">4. Información de la Cuenta</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Usted es responsable de mantener la confidencialidad de su cuenta y contraseña, 
                y de restringir el acceso a su computadora. Acepta asumir la responsabilidad de 
                todas las actividades que ocurran bajo su cuenta o contraseña.
              </p>
              <p>
                Nos reservamos el derecho de rechazar el servicio, terminar cuentas, eliminar o 
                editar contenido, o cancelar pedidos a nuestra sola discreción.
              </p>
            </div>
          </div>

          {/* Sección 5 */}
          <div>
            <h2 className="text-2xl font-bold text-gris-oscuro mb-4">5. Política de Privacidad</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Su privacidad es importante para nosotros. Nuestra Política de Privacidad explica 
                cómo recopilamos, usamos y protegemos su información cuando utiliza nuestro servicio.
              </p>
            </div>
          </div>

          {/* Sección 6 */}
          <div>
            <h2 className="text-2xl font-bold text-gris-oscuro mb-4">6. Limitación de Responsabilidad</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                En ningún caso Mercadillo Lima Perú o sus proveedores serán responsables de 
                cualquier daño (incluyendo, sin limitación, daños por pérdida de datos o ganancias, 
                o debido a la interrupción del negocio) que surja del uso o la incapacidad de usar 
                los materiales en el sitio web de Mercadillo Lima Perú.
              </p>
            </div>
          </div>

          {/* Sección 7 */}
          <div>
            <h2 className="text-2xl font-bold text-gris-oscuro mb-4">7. Modificaciones</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Mercadillo Lima Perú puede revisar estos términos de servicio para su sitio web 
                en cualquier momento sin previo aviso. Al usar este sitio web, usted acepta estar 
                sujeto a la versión actual de estos términos de servicio.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gris-claro">
              <strong>Última actualización:</strong> Enero 2024
            </p>
            <p className="text-sm text-gris-claro mt-2">
              Si tiene alguna pregunta sobre estos Términos y Condiciones, 
              póngase en contacto con nosotros en contactomercadillo@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
