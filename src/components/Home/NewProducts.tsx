import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Product = {
  id: string
  nombre: string
  precio: number
  slug?: string
  imagen?: string
}

export default function NewProducts({ limit = 8 }: { limit?: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // simple query: newest products by created_at desc
        const { data, error } = await supabase
          .from('productos')
          .select('id,nombre,precio,slug')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        if (!mounted) return

        const items: Product[] = (data || []).map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          slug: p.slug,
        }))

        // try to fetch main images in batch
        const ids = items.map((i) => i.id)
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
          items.forEach((it) => (it.imagen = imgMap.get(it.id)))
        }

        setProducts(items)
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

  // If no products found, attempt a broader fetch (order by updated_at or created_at) before showing empty state
  if (!products.length) {
    // perform a fallback fetch synchronously (quick attempt)
    // Note: we avoid another useEffect by doing a direct async IIFE here
    (async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(limit)
        if (!error && data && data.length) setProducts(data as any)
      } catch (e) {
        // ignore
      }
    })()
  }

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-4">Nuevos productos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((p) => (
          <a key={p.id} href={`/producto/${p.slug || p.id}`} className="block border rounded p-2 hover:shadow">
            <div className="h-40 bg-gray-100 flex items-center justify-center mb-2">
              {p.imagen ? <img src={p.imagen} alt={p.nombre} className="h-full w-full object-cover" /> : <div className="text-sm text-gray-500">Sin imagen</div>}
            </div>
            <div className="text-sm font-medium">{p.nombre}</div>
            <div className="text-sm text-gray-700">S/ {p.precio}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
