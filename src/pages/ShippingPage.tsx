import React from 'react'
import { Truck, RotateCcw, Clock, MapPin, Package, CreditCard } from 'lucide-react'

const ShippingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amarillo dark:bg-yellow-500 rounded-full flex items-center justify-center">
              <Truck className="w-8 h-8 text-gris-oscuro dark:text-gray-900" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Envíos y Devoluciones
          </h1>
          <p className="text-lg text-gris-claro dark:text-gray-400 max-w-2xl mx-auto">
            Información completa sobre nuestras políticas de envío y devoluciones 
            para que tengas la mejor experiencia de compra.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Sección Envíos */}
          <div className="card p-8">
            <div className="flex items-center mb-6">
              <Truck className="w-6 h-6 text-amarillo dark:text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">Política de Envíos</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Tiempos de entrega */}
              <div>
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 text-amarillo dark:text-yellow-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gris-oscuro dark:text-gray-100">Tiempos de Entrega</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">El Agustino y Santa Anita</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">24 horas</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Lima Este (SJL, ATE)</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">24-48 horas</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Lima Metropolitana</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">24-48 horas</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Lima Provincias</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">2-4 días hábiles</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Provincias</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">3-7 días hábiles</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Zonas Remotas</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">5-10 días hábiles</span>
                  </div>
                </div>
              </div>

              {/* Costos de envío */}
              <div>
                <div className="flex items-center mb-4">
                  <CreditCard className="w-5 h-5 text-amarillo dark:text-yellow-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gris-oscuro dark:text-gray-100">Costos de Envío</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">El Agustino y Santa Anita</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">S/ 10.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Lima Este (SJL, ATE)</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">S/ 12.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Lima Metropolitana</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">S/ 15.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Lima Provincias</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">S/ 25.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Provincias</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">S/ 35.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-green-600 dark:text-green-400 font-medium">Envío Gratis</span>
                    <span className="font-medium text-gris-oscuro dark:text-gray-200">Compras {'>'}= S/ 150</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ¡Envío gratuito en compras superiores a S/ 150.00 en todo el Perú!
                </p>
              </div>
            </div>

            <div className="text-gray-600 dark:text-gray-400 space-y-4">
              <h4 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-2">Información Importante:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Los tiempos de entrega se calculan en días hábiles (lunes a viernes)</li>
                <li>Los envíos se realizan de lunes a sábado</li>
                <li>Recibirás un código de seguimiento una vez que tu pedido sea despachado</li>
                <li>Es necesario que alguien esté presente para recibir el paquete</li>
                <li>Se requiere DNI para la entrega del pedido</li>
              </ul>
            </div>
          </div>

          {/* Sección Devoluciones */}
          <div className="card p-8">
            <div className="flex items-center mb-6">
              <RotateCcw className="w-6 h-6 text-amarillo dark:text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">Política de Devoluciones</h2>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  Tienes hasta 30 días calendario para solicitar una devolución
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Condiciones para devolución */}
              <div>
                <h3 className="text-lg font-semibold text-gris-oscuro dark:text-gray-100 mb-4">Condiciones para Devolución</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>El producto debe estar en su estado original</li>
                  <li>Debe incluir todos los accesorios y empaques</li>
                  <li>No debe mostrar signos de uso o daño</li>
                  <li>Debe conservar las etiquetas originales</li>
                  <li>Presentar la boleta o factura de compra</li>
                </ul>
              </div>

              {/* Productos no retornables */}
              <div>
                <h3 className="text-lg font-semibold text-gris-oscuro dark:text-gray-100 mb-4">Productos No Retornables</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Productos de higiene personal</li>
                  <li>Ropa íntima y trajes de baño</li>
                  <li>Productos personalizados</li>
                  <li>Productos perecederos</li>
                  <li>Software y productos digitales</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-gray-600 dark:text-gray-400">
              <h4 className="font-semibold text-gris-oscuro dark:text-gray-100">Proceso de Devolución:</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                    1
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Contacta nuestro servicio al cliente</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                    2
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Envía el producto siguiendo las instrucciones</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-amarillo dark:bg-yellow-500 text-gris-oscuro dark:text-gray-900 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                    3
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recibe tu reembolso en 5-7 días hábiles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Contacto */}
          <div className="card p-8">
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 text-amarillo dark:text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">¿Necesitas Ayuda?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-4">Servicio al Cliente</h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p><strong>Teléfono:</strong> +51 977 933 410</p>
                  <p><strong>Email:</strong> contactomercadillo@gmail.com</p>
                  <p><strong>Horarios:</strong> Lunes a Viernes 9:00 AM - 6:00 PM</p>
                  <p><strong>Sábados:</strong> 9:00 AM - 2:00 PM</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gris-oscuro dark:text-gray-100 mb-4">Dirección</h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p>Mercadillo Lima Perú</p>
                  <p>El Agustino</p>
                  <p>Lima Este 15007</p>
                  <p>Perú</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingPage
