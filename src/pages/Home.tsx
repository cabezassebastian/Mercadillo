import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Truck, Shield, Headphones } from 'lucide-react'
import { supabase, Producto } from '@/lib/supabase'
import ProductCard from '@/components/Product/ProductCard'

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .gt('stock', 0) // Corrección: Usar .gt para stock > 0
          .order('created_at', { ascending: false })
          .limit(8)

        if (error) {
          console.error('Error fetching products:', error)
          return
        }

        setFeaturedProducts(data || [])
      } catch (error) {
        console.error('Error in fetchFeaturedProducts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const features = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Envío Rápido',
      description: 'Entrega en 24-48 horas en Lima'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Compra Segura',
      description: 'Pagos protegidos con Stripe'
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Soporte 24/7',
      description: 'Atención al cliente siempre disponible'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amarillo to-dorado py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gris-oscuro mb-6">
            Bienvenido a Mercadillo Lima
          </h1>
          <p className="text-xl md:text-2xl text-gris-oscuro mb-8 max-w-3xl mx-auto">
            Descubre los mejores productos de Lima, Perú. 
            Calidad garantizada y envío rápido a todo el país.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalogo"
              className="btn-secondary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/carrito"
              className="bg-blanco text-gris-oscuro hover:bg-hueso font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Mi Carrito
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blanco">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-amarillo rounded-full flex items-center justify-center mx-auto mb-4 text-gris-oscuro">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gris-oscuro mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-hueso">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gris-oscuro mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra selección de productos más populares y mejor valorados
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/catalogo"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
            >
              <span>Ver Todos los Productos</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-blanco">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gris-oscuro mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'María González',
                location: 'Miraflores, Lima',
                rating: 5,
                comment: 'Excelente servicio y productos de calidad. El envío fue súper rápido.'
              },
              {
                name: 'Carlos Mendoza',
                location: 'San Isidro, Lima',
                rating: 5,
                comment: 'Muy buena experiencia de compra. Definitivamente volveré a comprar.'
              },
              {
                name: 'Ana Rodríguez',
                location: 'La Molina, Lima',
                rating: 5,
                comment: 'Productos auténticos y precios justos. Recomendado al 100%.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amarillo fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-semibold text-gris-oscuro">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home


