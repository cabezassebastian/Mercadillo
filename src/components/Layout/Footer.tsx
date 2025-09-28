import { Link } from 'react-router-dom'
import { Package, Mail, Phone, MapPin, Facebook, MessageCircle } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gris-oscuro text-blanco">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-amarillo rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-gris-oscuro" />
              </div>
              <span className="text-xl font-bold">Mercadillo Lima Perú</span>
            </div>
            <p className="text-gris-claro mb-4 max-w-md">
              Tu tienda online de confianza en El Agustino, Lima Este. Productos de calidad 
              con envío rápido y seguro a toda Lima y el Perú.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gris-claro">
                <MapPin className="w-4 h-4" />
                <span>El Agustino, Lima Este 15007</span>
              </div>
              <div className="flex items-center space-x-2 text-gris-claro">
                <Phone className="w-4 h-4" />
                <span>+51 977 933 410</span>
              </div>
              <div className="flex items-center space-x-2 text-gris-claro">
                <Mail className="w-4 h-4" />
                <span>contactomercadillo@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gris-claro hover:text-amarillo transition-colors duration-200">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-gris-claro hover:text-amarillo transition-colors duration-200">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="text-gris-claro hover:text-amarillo transition-colors duration-200">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Información</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terminos" className="text-gris-claro hover:text-amarillo transition-colors duration-200">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-gris-claro hover:text-amarillo transition-colors duration-200">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/envios" className="text-gris-claro hover:text-amarillo transition-colors duration-200">
                  Envíos y Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gris-claro hover:text-amarillo transition-colors duration-200">
                  Contacto
                </Link>
              </li>
            </ul>
            
            {/* Redes Sociales debajo de Contacto */}
            <div className="flex space-x-3 mt-4">
              <a
                href="https://wa.me/51977933410"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.facebook.com/mercadillo.276649"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center">
          <p className="text-gris-claro">
            © 2025 Mercadillo Lima Perú. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


