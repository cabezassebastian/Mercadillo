import { useEffect, useState } from 'react'
import { relatedByCategoryAndPrice } from '../../lib/recommendations'
import { supabase, Producto } from '../../lib/supabase'
import ProductCard from '@/components/Product/ProductCard'

export default function RecommendedForYou({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Try to read navigation history from localStorage: array of product ids
        const raw = typeof window !== 'undefined' ? localStorage.getItem('nav_history') : null
        const historyIds: string[] = raw ? JSON.parse(raw) : []

        if (historyIds.length) {
          // get the most recent product id and fetch related by category+price
          const lastId = historyIds[historyIds.length - 1]
          const recs = await relatedByCategoryAndPrice(lastId, limit)
          if (mounted && recs && recs.length) {
            setItems(recs as any)
            return
          }
        }

        // fallback: show top new-ish or top sellers: fetch some recent products
        const { data, error } = await supabase
          .from('productos')
          .select('id,nombre,precio,slug,imagen,descripcion,stock,categoria,created_at,updated_at,rating_promedio,total_vendidos')
          .order('created_at', { ascending: false })
          .limit(limit)
        if (error) throw error
        
        // Fetch images for products
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
        
        if (mounted) setItems(data || [])
      } catch (e) {
        console.error('RecommendedForYou error', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [limit])

  if (loading) return <div className="py-8">Cargando recomendaciones...</div>
  if (!items.length) return null

  return (
    <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100 mb-4">
            Quizás te interese
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Productos seleccionados especialmente para ti
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
    </section>
  )
}
