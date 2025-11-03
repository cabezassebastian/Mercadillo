import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Truck, Shield, Headphones } from 'lucide-react'
import { supabase, Producto } from '@/lib/supabase'
import ProductCard from '@/components/Product/ProductCard'
import { topSellers } from '@/lib/recommendations'
import RecommendedForYou from '@/components/Home/RecommendedForYou'
import NewProducts from '@/components/Home/NewProducts'

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([])
  const [topWeek, setTopWeek] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) 

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let productsQuery = supabase.from('productos').select('*').gt('stock', 0)
        let { data, error: supabaseError } = await productsQuery.order('created_at', { ascending: false }).limit(8)

        if (supabaseError) {
          // Si falla la ordenación por created_at, intentar sin ordenación
          const { data: fallbackData, error: fallbackError } = await productsQuery.limit(8)

          if (fallbackError) {
            setError('No se pudo cargar la informacion, intentalo mas tarde')
            return
          }
          data = fallbackData
        }

        // Obtener imágenes principales para cada producto
        if (data && data.length > 0) {
          const productosConImagenes = await Promise.all(
            data.map(async (producto) => {
              const { data: imagenes } = await supabase
                .from('producto_imagenes')
                .select('url')
                .eq('producto_id', producto.id)
                .eq('es_principal', true)
                .single()
              
              // Si hay imagen principal en la galería, usarla; si no, usar la imagen original
              return {
                ...producto,
                imagen: imagenes?.url || producto.imagen
              }
            })
          )
          setFeaturedProducts(productosConImagenes)
        } else {
          setFeaturedProducts(data || [])
        }

        try {
          const tops = await topSellers('week', 8)
          setTopWeek(tops as Producto[])
        } catch (err) {
          console.error('Error fetching top sellers', err)
        }
      } catch (err) {
        setError('Ocurrio un error inesperado al cargar los productos.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const features = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Envio Rapido',
      description: 'Entrega en 24-48 horas en El Agustino y Lima Este'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Compra Segura',
      description: 'Pagos seguros con Mercado Pago'
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Soporte 24/7',
      description: 'Atencion al cliente siempre disponible'
    }
  ]

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 transition-colors duration-200">
      {/* Seccion Hero */}
      <section className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
        <img 
          src="https://res.cloudinary.com/ddbjhpjri/image/upload/f_auto,q_auto,w_1920,h_400,c_fill,g_center/v1759101989/mercadillo/banner_v1.webp" 
          alt="Mercadillo Lima Peru Banner" 
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div 
          style={{ display: 'none' }} 
          className="absolute inset-0 bg-gradient-to-r from-amarillo to-dorado dark:from-yellow-600 dark:to-yellow-400 flex items-center justify-center"
        >
          <div className="text-center text-gris-oscuro dark:text-gray-100">
            <div className="text-6xl font-bold mb-4">🏪</div>
            <h2 className="text-2xl font-bold">Mercadillo Lima Perú</h2>
          </div>
        </div>
        <div className="absolute inset-0 bg-gris-oscuro bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center text-center p-4">
          <div className="max-w-3xl mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-blanco mb-3 sm:mb-4 px-2">
              Bienvenido a Mercadillo Lima Perú
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-hueso dark:text-gray-200 mb-4 sm:mb-6 md:mb-8 px-2">
              Descubre los mejores productos de Lima. Calidad garantizada y envio rapido a toda la ciudad.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full max-w-md sm:max-w-none mx-auto px-6 sm:px-4">
              <Link
                to="/catalogo"
                className="btn-primary text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              </Link>
              <Link
                to="/carrito"
                className="bg-blanco dark:bg-gray-800 text-gris-oscuro dark:text-gray-200 hover:bg-hueso dark:hover:bg-gray-700 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base md:text-lg text-center w-full sm:w-auto"
              >
                Mi Carrito
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seccion de Caracteristicas */}
      <section className="py-16 bg-blanco dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-amarillo dark:bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-gris-oscuro dark:text-gray-900">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 bg-hueso dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 dark:text-gray-100 mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Descubre nuestra seleccion de productos mas populares y mejor valorados
            </p>
          </div>

          {/* Top sellers de la semana */}
          {topWeek && topWeek.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">Más vendidos de la semana</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topWeek.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo dark:border-yellow-500"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-red-100 dark:bg-red-900 rounded-lg shadow-md max-w-md mx-auto">
              <p className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4">⚠️ Error al cargar productos</p>
              <p className="text-gray-700 dark:text-gray-300">{error}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Por favor, verifica tu conexion a internet o intentalo de nuevo mas tarde.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}

          {/* Quizás te interese (basado en historial) */}
          <div className="mt-12">
            <RecommendedForYou />
          </div>

          {/* Nuevos productos */}
          <div className="mt-12">
            <NewProducts limit={8} />
          </div>

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

      {/* Seccion de Testimonios */}
      <section className="py-16 bg-blanco dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 dark:text-gray-100 mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[ // Datos de testimonios
              {
                name: 'Maria Gonzalez',
                location: 'El Agustino, Lima',
                rating: 5,
                comment: 'Excelente servicio y productos de calidad. El envio fue super rapido aqui en El Agustino.'
              },
              {
                name: 'Carlos Mendoza',
                location: 'Santa Anita, Lima',
                rating: 5,
                comment: 'Muy buena experiencia de compra. Me llego rapidisimo desde El Agustino.'
              },
              {
                name: 'Ana Rodriguez',
                location: 'San Juan de Lurigancho, Lima',
                rating: 5,
                comment: 'Productos autenticos y precios justos. Perfecto para la zona de Lima Este.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amarillo dark:text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-semibold text-gris-oscuro dark:text-gray-100">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
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


