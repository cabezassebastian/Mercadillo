import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { relatedByCategoryAndPrice, alsoBought } from '@/lib/recommendations'
import { supabase } from '@/lib/supabase'

type Props = {
  productId: string
  category?: string
  price?: number
}

const SkeletonCard = () => (
  <div className="w-48 sm:w-56 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse">
    <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
)

const ProductCardMini: React.FC<{ p: any }> = ({ p }) => {
  return (
    <Link to={`/producto/${p.id}`} className="w-48 sm:w-56 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="h-36 w-full mb-3 overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
        <img src={p.imagen || p.imagenes?.[0]?.url || p.imagenes?.url || ''} alt={p.nombre} className="object-cover w-full h-full" />
      </div>
      <h4 className="text-sm font-medium text-gris-oscuro dark:text-gray-100 truncate">{p.nombre}</h4>
      <div className="text-dorado font-bold mt-1">S/ {p.precio?.toFixed(2)}</div>
    </Link>
  )
}

const RelatedProducts: React.FC<Props> = ({ productId, category, price }) => {
  const [related, setRelated] = useState<any[]>([])
  const [also, setAlso] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const relatedRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      try {
  const byCategory = await relatedByCategoryAndPrice(productId, 6)
  const alsoData = await alsoBought(productId, 6)

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

        setRelated(byCatArr)
        setAlso(alsoFiltered)
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

  const scrollBy = (ref: React.RefObject<HTMLDivElement>, delta = 300) => {
    if (!ref.current) return
    ref.current.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const renderList = (items: any[], ref?: React.RefObject<HTMLDivElement>) => (
    <div className="relative">
      <button onClick={() => scrollBy(ref || relatedRef, -320)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
        ‹
      </button>
      <div ref={ref || relatedRef} className="flex space-x-4 overflow-x-auto py-2 px-1 scrollbar-hide">
        {items.map((p) => (
          <ProductCardMini key={p.id} p={p} />
        ))}
      </div>
      <button onClick={() => scrollBy(ref || relatedRef, 320)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
        ›
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
          renderList(related)
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
            renderList(also)
          ) : (
            <div className="text-gray-600">No hay datos de compras relacionadas.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RelatedProducts
