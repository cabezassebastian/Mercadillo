import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Option = { id: string; name: string; position: number }
type Value = { id: string; value: string; position: number }

export default function VariantsEditor({ productoId, onClose }: { productoId: string, onClose?: () => void }) {
  const [options, setOptions] = useState<Option[]>([])
  const [valuesMap, setValuesMap] = useState<Record<string, Value[]>>({})
  const [newOptionName, setNewOptionName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [variants, setVariants] = useState<any[]>([])

  useEffect(() => { loadOptions() }, [productoId])

  const loadOptions = async () => {
  const { data: opts, error: _optsErr } = await supabaseAdmin
      .from('product_options')
      .select('*')
      .eq('product_id', productoId)
      .order('position', { ascending: true })
    setOptions(opts || [])

    const map: Record<string, Value[]> = {}
    if (opts && opts.length) {
      for (const o of opts) {
    const { data: vals, error: _valsErr } = await supabaseAdmin
          .from('product_option_values')
          .select('*')
          .eq('option_id', o.id)
          .order('position', { ascending: true })
        map[o.id] = vals || []
      }
    }
    setValuesMap(map)
    // load variants
    const { data: vars } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', productoId)
    setVariants(vars || [])
  }

  const createOption = async () => {
    if (!newOptionName.trim()) return
    setIsLoading(true)
    await supabaseAdmin
      .from('product_options')
      .insert([{ product_id: productoId, name: newOptionName }])
      .select()
    setIsLoading(false)
    setNewOptionName('')
    loadOptions()
  }

  const addValue = async (optionId: string, value: string) => {
    if (!value.trim()) return
    await supabaseAdmin
      .from('product_option_values')
      .insert([{ option_id: optionId, value }])
      .select()
    loadOptions()
  }

  const generateVariants = async () => {
    // Simple generator: combine values across options and create variants.
    // Pricing rule: if option value label contains 'L' (talla L) then price = base + 1, S/M same as base.
    setIsLoading(true)

    // Fetch product base price
  const { data: product, error: _prodErr } = await supabaseAdmin.from('productos').select('id, precio').eq('id', productoId).single()
  const basePrice = product?.precio || 0

    // Build combinations
    const optionLists = Object.values(valuesMap)
    if (optionLists.length === 0) {
      alert('No hay valores para generar variantes')
      setIsLoading(false)
      return
    }

    const combos: string[][] = [[]]
    for (const list of optionLists) {
      const next: string[][] = []
      for (const combo of combos) {
        for (const v of list) next.push([...combo, v.id])
      }
      combos.splice(0, combos.length, ...next)
    }

    // Insert variants
    for (const combo of combos) {
      // Determine price:
      // if any of the option value labels is 'L' (exact match) then +1 sol
      let price = basePrice
      for (const optId in valuesMap) {
        const vals = valuesMap[optId]
        for (const vid of combo) {
          const found = vals.find(v => v.id === vid)
          if (found && found.value.toUpperCase() === 'L') price = parseFloat((price + 1).toFixed(2))
        }
      }

      await supabaseAdmin.from('product_variants').insert([{ product_id: productoId, price, stock: 0, attributes: '{}', option_value_ids: combo }])
    }
    setIsLoading(false)
    await loadOptions()
    alert('Variantes generadas')
    if (onClose) onClose()
  }

  const handleVariantChange = (id: string, field: string, value: any) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const saveVariant = async (v: any) => {
    setIsLoading(true)
    const payload: any = {
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      is_active: v.is_active,
      attributes: v.attributes || {}
    }
    await supabaseAdmin.from('product_variants').update(payload).eq('id', v.id)
    await loadOptions()
    setIsLoading(false)
  }

  const deleteVariant = async (id: string) => {
    if (!confirm('¿Eliminar variante? Esta acción no se puede deshacer.')) return
    setIsLoading(true)
    await supabaseAdmin.from('product_variants').delete().eq('id', id)
    await loadOptions()
    setIsLoading(false)
  }

  return (
    <div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input className="input-field" value={newOptionName} onChange={(e) => setNewOptionName(e.target.value)} placeholder="Nombre de la opción (ej. Talla)" />
          <button className="btn-primary" onClick={createOption} disabled={isLoading}>Crear opción</button>
        </div>

        {options.map(opt => (
          <div key={opt.id} className="border p-3 rounded">
            <div className="flex justify-between items-center">
              <strong>{opt.name}</strong>
            </div>
            <div className="mt-2">
              <div className="flex gap-2">
                <input placeholder="Nuevo valor (ej. S)" id={`val-${opt.id}`} className="input-field" />
                <button className="btn-secondary" onClick={() => {
                  const el = document.getElementById(`val-${opt.id}`) as HTMLInputElement | null
                  if (el) addValue(opt.id, el.value)
                }}>Agregar valor</button>
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                {(valuesMap[opt.id] || []).map(v => (
                  <span key={v.id} className="px-2 py-1 bg-gray-100 rounded">{v.value}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button className="btn-primary" onClick={generateVariants} disabled={isLoading}>Generar variantes automáticas (aplica regla S/M/L)</button>
        </div>

        {/* Variants list */}
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Variantes existentes</h4>
          {variants.length === 0 && <p className="text-sm text-gray-500">No hay variantes aún.</p>}
          {variants.map(v => (
            <div key={v.id} className="flex items-center gap-2 mb-2">
              <div className="w-48">
                <input className="input-field" value={v.sku || ''} onChange={(e) => handleVariantChange(v.id, 'sku', e.target.value)} placeholder="SKU" />
              </div>
              <div className="w-32">
                <input type="number" className="input-field" value={v.price ?? ''} onChange={(e) => handleVariantChange(v.id, 'price', parseFloat(e.target.value || '0'))} placeholder="Precio" />
              </div>
              <div className="w-24">
                <input type="number" className="input-field" value={v.stock ?? 0} onChange={(e) => handleVariantChange(v.id, 'stock', parseInt(e.target.value || '0'))} placeholder="Stock" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!v.is_active} onChange={(e) => handleVariantChange(v.id, 'is_active', e.target.checked)} /> Activa
              </label>
              <div className="flex items-center gap-2 ml-auto">
                <button className="btn-secondary" onClick={() => saveVariant(v)} disabled={isLoading}>Guardar</button>
                <button className="btn-danger" onClick={() => deleteVariant(v.id)} disabled={isLoading}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
