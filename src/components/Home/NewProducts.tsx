import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ProductCard from '@/components/Product/ProductCard'

export default function NewProducts({ limit = 8 }: { limit?: number }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // fetch newest products by updated_at then created_at
        let { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(limit)

        if (error || !data || data.length === 0) {
          const fallback = await supabase.from('productos').select('*').order('created_at', { ascending: false }).limit(limit)
          data = fallback.data
        }

        if (error) throw error
        if (!mounted) return

        // try to fetch main images in batch
        const ids = (data || []).map((p: any) => p.id)
        if (ids.length) {
          const { data: imgs } = await supabase
            .from('producto_imagenes')
            .select('producto_id,url,es_principal')
            .in('producto_id', ids)
          const imgMap = new Map<string, string>()
          ;(imgs || []).forEach((img: any) => {
            if (img.es_principal) imgMap.set(img.producto_id, img.url)
            else if (!imgMap.has(img.producto_id)) imgMap.set(img.producto_id, img.url)
          })
          if (data && Array.isArray(data)) {
            data.forEach((it: any) => {
              if (!it.imagen && imgMap.has(it.id)) it.imagen = imgMap.get(it.id)
            })
          }
        }

        setProducts(data || [])
      } catch (e) {
        console.error('NewProducts load error', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [limit])

  if (loading) return <div className="py-8">Cargando nuevos productos...</div>

  // Header: mimic the featured section style with centered description
  return (
    <section className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">Productos Nuevos</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Descubre los productos más recientes agregados a nuestra tienda</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
    </section>
  )
}
