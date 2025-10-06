import { useEffect, useState } from 'react'
import { relatedByCategoryAndPrice } from '../../lib/recommendations'
import { supabase } from '../../lib/supabase'

type Product = { id: string; nombre: string; precio: number; slug?: string; imagen?: string }

export default function RecommendedForYou({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<Product[]>([])
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
          .select('id,nombre,precio,slug')
          .order('created_at', { ascending: false })
          .limit(limit)
        if (error) throw error
        const fallback = (data || []).map((p: any) => ({ id: p.id, nombre: p.nombre, precio: p.precio, slug: p.slug }))
        if (mounted) setItems(fallback)
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
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-4">Quizás te interese</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <a key={p.id} href={`/producto/${p.slug || p.id}`} className="block border rounded p-2 hover:shadow">
            <div className="h-36 bg-gray-100 flex items-center justify-center mb-2">
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
