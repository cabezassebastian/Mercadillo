import React from 'react'

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gris-oscuro dark:text-white mb-8 text-center">
            Sobre Nosotros
          </h1>
          
          <div className="prose max-w-none text-gris-oscuro dark:text-gray-300">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gris-oscuro dark:text-white mb-4">
                ¿Quiénes Somos?
              </h2>
              <p className="text-lg leading-relaxed mb-4">
                Mercadillo Lima Perú es tu destino confiable para productos de calidad a precios accesibles. 
                Nos dedicamos a conectar a vendedores locales con compradores que buscan productos únicos y auténticos.
              </p>
              <p className="text-lg leading-relaxed">
                Desde nuestros inicios, hemos trabajado para crear una plataforma que refleje la diversidad 
                y riqueza de los productos peruanos, ofreciendo una experiencia de compra segura y satisfactoria.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gris-oscuro dark:text-white mb-4">
                Nuestra Misión
              </h2>
              <p className="text-lg leading-relaxed">
                Facilitar el comercio local y promover productos de calidad, creando un puente entre 
                vendedores y compradores que beneficie a toda la comunidad. Creemos en el poder del 
                comercio justo y en apoyar a los emprendedores locales.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gris-oscuro dark:text-white mb-4">
                Nuestra Visión
              </h2>
              <p className="text-lg leading-relaxed">
                Ser la plataforma líder de comercio electrónico en Lima, reconocida por la calidad 
                de nuestros productos, la excelencia en el servicio al cliente y nuestro compromiso 
                con el desarrollo económico local.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gris-oscuro dark:text-white mb-4">
                Nuestros Valores
              </h2>
              <ul className="list-disc list-inside space-y-2 text-lg">
                <li><strong>Calidad:</strong> Ofrecemos solo productos que cumplen con nuestros altos estándares.</li>
                <li><strong>Confianza:</strong> Construimos relaciones duraderas basadas en la transparencia.</li>
                <li><strong>Comunidad:</strong> Apoyamos a vendedores locales y contribuimos al crecimiento económico.</li>
                <li><strong>Innovación:</strong> Mejoramos continuamente nuestra plataforma y servicios.</li>
                <li><strong>Sostenibilidad:</strong> Promovemos prácticas comerciales responsables con el medio ambiente.</li>
              </ul>
            </div>

            <div className="bg-amarillo/10 dark:bg-yellow-400/10 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gris-oscuro dark:text-white mb-4">
                ¿Por Qué Elegirnos?
              </h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start">
                  <span className="text-amarillo mr-2">✓</span>
                  <span>Productos auténticos y de calidad verificada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amarillo mr-2">✓</span>
                  <span>Envíos seguros y rápidos en toda Lima</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amarillo mr-2">✓</span>
                  <span>Atención al cliente personalizada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amarillo mr-2">✓</span>
                  <span>Precios competitivos y ofertas especiales</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amarillo mr-2">✓</span>
                  <span>Plataforma segura y fácil de usar</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage