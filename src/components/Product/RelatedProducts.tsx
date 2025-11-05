import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { relatedByCategoryAndPrice, alsoBought } from '@/lib/recommendations'
import { supabase } from '@/lib/supabase'
import OptimizedImage from '@/components/common/OptimizedImage'
import StarRating from '@/components/common/StarRating'
import { ArrowLeft, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'
import { getProductUrl } from '@/lib/slugify'

type Props = {
  productId: string
  category?: string
  price?: number
}

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <div className="relative h-[200px] w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]"></div>
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-4/5 animate-shimmer bg-[length:200%_100%]"></div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-2/3 animate-shimmer bg-[length:200%_100%]"></div>
      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/2 animate-shimmer bg-[length:200%_100%]"></div>
    </div>
  </div>
)

const ProductCardMini: React.FC<{ p: any; index: number }> = ({ p, index }) => {
  const precio = typeof p.precio === 'number' ? p.precio : Number(p.precio || 0)
  const isNew = p.created_at && new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  return (
    <Link 
      to={getProductUrl(p.slug || p.id, p.nombre)} 
      className="group flex-shrink-0 w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Container */}
      <div className="relative w-full h-[200px] overflow-hidden bg-gray-50 dark:bg-gray-900">
        <OptimizedImage 
          src={p.imagen || p.imagenes?.[0]?.url || p.imagenes?.url || ''} 
          alt={p.nombre} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        
        {/* Badge Nuevo */}
        {isNew && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amarillo text-gris-oscuro text-xs font-bold rounded-full shadow-lg">
              <Sparkles className="w-3 h-3" />
              Nuevo
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h4 className="text-sm font-semibold text-gris-oscuro dark:text-gray-100 line-clamp-2 min-h-[40px] group-hover:text-dorado transition-colors">
          {p.nombre}
        </h4>
        
        <div className="flex items-center gap-1">
          <StarRating rating={p.rating_promedio || 0} readonly size="sm" />
          {p.rating_promedio > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({p.rating_promedio.toFixed(1)})
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <div className="text-lg font-bold text-dorado dark:text-amarillo">
            {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio)}
          </div>
        </div>
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
    <div className="relative">
      {/* Left Arrow */}
      <button 
        aria-label="Desplazar izquierda" 
        onClick={() => scrollBy(ref || relatedRef, -220)} 
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 p-2.5 bg-white dark:bg-gray-800 hover:bg-amarillo dark:hover:bg-amarillo rounded-full shadow-lg border border-gray-200 dark:border-gray-700 opacity-90 hover:opacity-100 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amarillo"
      >
        <ArrowLeft className="w-5 h-5 text-gris-oscuro dark:text-gray-100" />
      </button>
      
      {/* Scrollable Container */}
      <div
        ref={ref || relatedRef}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, ref)}
        className="flex gap-4 overflow-x-auto py-2 px-1 focus:outline-none scrollbar-hide scroll-smooth"
        role="list"
        aria-label="Lista de productos"
      >
        {items.map((p, index) => (
          <ProductCardMini key={p.id} p={p} index={index} />
        ))}
      </div>
      
      {/* Right Arrow */}
      <button 
        aria-label="Desplazar derecha" 
        onClick={() => scrollBy(ref || relatedRef, 220)} 
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 p-2.5 bg-white dark:bg-gray-800 hover:bg-amarillo dark:hover:bg-amarillo rounded-full shadow-lg border border-gray-200 dark:border-gray-700 opacity-90 hover:opacity-100 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amarillo"
      >
        <ArrowRight className="w-5 h-5 text-gris-oscuro dark:text-gray-100" />
      </button>
    </div>
  )

  return (
    <div className="mt-12 py-8 bg-hueso dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Productos Relacionados Section */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-amarillo dark:bg-amarillo rounded-lg shadow-md">
              <Sparkles className="w-5 h-5 text-gris-oscuro" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">
                Productos relacionados
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Descubre productos similares que podrían interesarte
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-x-auto py-2">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : related.length > 0 ? (
            renderList(related, relatedRef)
          ) : (
            <div className="text-center py-8 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron productos relacionados
              </p>
            </div>
          )}
        </div>

        {/* También Compraron Section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-dorado dark:bg-dorado rounded-lg shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">
                Otros clientes también compraron
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Productos frecuentemente comprados juntos
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex gap-4 overflow-x-auto py-2">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : also.length > 0 ? (
            renderList(also, alsoRef)
          ) : (
            <div className="text-center py-8 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No hay datos de compras relacionadas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RelatedProducts
