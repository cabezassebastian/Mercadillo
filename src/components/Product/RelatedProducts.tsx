import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { relatedByCategoryAndPrice, alsoBought } from '@/lib/recommendations'
import { supabase } from '@/lib/supabase'
import OptimizedImage from '@/components/common/OptimizedImage'
import StarRating from '@/components/common/StarRating'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type Props = {
  productId: string
  category?: string
  price?: number
}

const SkeletonCard = () => (
  <div className="w-48 sm:w-56 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <div className="h-40 w-full mb-3 overflow-hidden rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
)

const ProductCardMini: React.FC<{ p: any }> = ({ p }) => {
  const precio = typeof p.precio === 'number' ? p.precio : Number(p.precio || 0)
  return (
    <Link to={`/producto/${p.id}`} className="min-w-[220px] w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 active:translate-y-0 p-3">
      <div className="aspect-square overflow-hidden rounded-xl relative bg-gray-50 mb-3">
        <OptimizedImage src={p.imagen || p.imagenes?.[0]?.url || p.imagenes?.url || ''} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <h4 className="text-sm font-semibold text-gris-oscuro dark:text-gray-100 mb-1 line-clamp-2">{p.nombre}</h4>
      <div className="flex items-center justify-between">
        <StarRating rating={p.rating_promedio || 0} readonly size="sm" />
        <div className="text-dorado font-bold text-sm">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio)}</div>
      </div>
    </Link>
  )
}

const RelatedProducts: React.FC<Props> = ({ productId, category, price }) => {
  const [related, setRelated] = useState<any[]>([])
  const [also, setAlso] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const relatedRef = useRef<HTMLDivElement | null>(null)
  const alsoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true

      const load = async () => {
      setLoading(true)
      try {
  const byCategory = await relatedByCategoryAndPrice(productId, 6)
    let alsoData = await alsoBought(productId, 6)

    // If alsoBought returned empty, try to build it from pedidos table directly
    if ((!alsoData || alsoData.length === 0) && supabase) {
      try {
        // Get pedidos that include this product by scanning pedidos.items
        const { data: pedidosRows } = await supabase
          .from('pedidos')
          .select('id, items')
          .limit(1000)

        const otherProductCounts: Record<string, number> = {}
        ;(pedidosRows || []).forEach((row: any) => {
          const items = row.items || []
          const has = items.find((it: any) => String(it.id) === String(productId))
          if (has) {
            items.forEach((it: any) => {
              if (!it || !it.id) return
              const pid = String(it.id)
              if (pid === productId) return
              otherProductCounts[pid] = (otherProductCounts[pid] || 0) + (it.cantidad || 1)
            })
          }
        })

        const picked = Object.entries(otherProductCounts)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 6)
          .map(([id]) => id)

        if (picked.length > 0) {
          const { data: prods } = await supabase.from('productos').select('*').in('id', picked)
          alsoData = (prods || []) as any[]
        }
      } catch (e) {
        // ignore and keep alsoData empty
      }
    }

        if (!mounted) return

        // Filtrar duplicados entre listas y limitar a 6
        const byCatArr = (byCategory || []).slice(0, 6)
        const alsoArr = (alsoData || []).slice(0, 6)
        const byCatIds = new Set(byCatArr.map((p: any) => p.id))
        const alsoFiltered = alsoArr.filter((p: any) => !byCatIds.has(p.id)).slice(0, 6)

        // Obtener imagen principal (producto_imagenes) para los ids combinados
        const allIds = Array.from(new Set([...byCatArr.map((p: any) => p.id), ...alsoFiltered.map((p: any) => p.id)]))
        if (allIds.length > 0) {
          const { data: imgs } = await supabase
            .from('producto_imagenes')
            .select('producto_id, url, es_principal')
            .in('producto_id', allIds)
            .order('orden', { ascending: true })

          const mapFirst: Record<string, string> = {}
          ;(imgs || []).forEach((row: any) => {
            if (!mapFirst[row.producto_id]) mapFirst[row.producto_id] = row.url
            if (row.es_principal) mapFirst[row.producto_id] = row.url
          })

          // Aplicar imagenes a los productos si no tienen imagen principal
          byCatArr.forEach((p: any) => {
            if (!p.imagen && mapFirst[p.id]) p.imagen = mapFirst[p.id]
            if (!p.imagenes && mapFirst[p.id]) p.imagenes = [{ url: mapFirst[p.id] }]
          })
          alsoFiltered.forEach((p: any) => {
            if (!p.imagen && mapFirst[p.id]) p.imagen = mapFirst[p.id]
            if (!p.imagenes && mapFirst[p.id]) p.imagenes = [{ url: mapFirst[p.id] }]
          })
        }

        // If alsoFiltered is empty, fetch fallback products from other categories so the section is never empty
        let finalAlso = alsoFiltered
        if ((!finalAlso || finalAlso.length === 0) && supabase) {
          try {
            // Try to exclude the current product's category if we have one
            const cat = ((byCatArr[0] as any) && ((byCatArr[0] as any).categoria || (byCatArr[0] as any).categoria_id)) || category || null
            let q = supabase.from('productos').select('*').neq('id', productId).order('rating_promedio', { ascending: false }).limit(6)
            if (cat) {
              // If categoria is a string field in your schema
              q = q.neq('categoria', cat as any)
            }
            const { data: fallbackProds } = await q
            finalAlso = (fallbackProds || []).slice(0, 6)
          } catch (e) {
            // If fallback fails, last resort: newest products
            try {
              const { data: newest } = await supabase.from('productos').select('*').neq('id', productId).order('created_at', { ascending: false }).limit(6)
              finalAlso = (newest || []).slice(0, 6)
            } catch (ee) {
              finalAlso = []
            }
          }
        }

        setRelated(byCatArr)
        setAlso(finalAlso)
      } catch (err) {
        console.error('Error loading related products', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [productId, category, price])

  // Keyboard navigation: left/right arrows scroll focused carousel
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, ref?: React.RefObject<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      ;(ref || relatedRef).current?.scrollBy({ left: -320, behavior: 'smooth' })
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      ;(ref || relatedRef).current?.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }, [])

  const scrollBy = (ref: React.RefObject<HTMLDivElement>, delta = 300) => {
    if (!ref.current) return
    ref.current.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const renderList = (items: any[], ref?: React.RefObject<HTMLDivElement>) => (
    <div className="relative group">
      <button aria-label="Desplazar izquierda" onClick={() => scrollBy(ref || relatedRef, -320)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-90 hover:opacity-100 focus:outline-none focus:ring">
        <ArrowLeft className="w-5 h-5 text-gris-oscuro dark:text-gray-100" />
      </button>
      <div
        ref={ref || relatedRef}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, ref)}
        className="flex space-x-4 overflow-x-auto py-2 px-1 focus:outline-none no-scrollbar"
        role="list"
        aria-label="Lista de productos"
      >
        {items.map((p) => (
          <ProductCardMini key={p.id} p={p} />
        ))}
      </div>
      <button aria-label="Desplazar derecha" onClick={() => scrollBy(ref || relatedRef, 320)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-90 hover:opacity-100 focus:outline-none focus:ring">
        <ArrowRight className="w-5 h-5 text-gris-oscuro dark:text-gray-100" />
      </button>
    </div>
  )

  return (
    <div className="mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gris-oscuro">Productos relacionados</h3>
        </div>

        {loading ? (
          <div className="flex space-x-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : related.length > 0 ? (
          renderList(related, relatedRef)
        ) : (
          <div className="text-gray-600">No se encontraron productos relacionados.</div>
        )}

        {/* Also bought */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-semibold text-gris-oscuro">Otros clientes también compraron</h4>
          </div>
          {loading ? (
            <div className="flex space-x-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : also.length > 0 ? (
            renderList(also, alsoRef)
          ) : (
            <div className="text-gray-600">No hay datos de compras relacionadas.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RelatedProducts
