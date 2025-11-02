import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { API_ENDPOINTS } from '../../config/api'

type Option = { id: string; name: string; position: number }
type Value = { id: string; value: string; position: number; metadata?: any }
type Variant = {
  id: string
  product_id?: string
  price?: number | null
  stock?: number | null
  is_active?: boolean
  attributes?: Record<string, any>
  option_value_ids?: Array<string | number>
  // internal UI flag
  __dirty?: boolean
}

export default function VariantsEditor({ productoId }: { productoId: string }) {
  const [options, setOptions] = useState<Option[]>([])
  const [valuesMap, setValuesMap] = useState<Record<string, Value[]>>({})
  const [sizeSelections, setSizeSelections] = useState<Record<string, boolean>>({})
  const [colorSelections, setColorSelections] = useState<Record<string, boolean>>({})
  const [newOptionName, setNewOptionName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [autoGenerateOnSave, setAutoGenerateOnSave] = useState(true)

  useEffect(() => { loadOptions() }, [productoId])

  const loadOptions = async () => {
    // Read options and values from server endpoint to avoid admin client usage in browser
    try {
      const res = await fetch(API_ENDPOINTS.admin(`options&productId=${encodeURIComponent(productoId)}`))
      const json = await res.json()
      if (!res.ok) {
        console.error('Error fetching options from server:', json)
        setOptions([])
        setValuesMap({})
      } else {
        const opts = json.options || []
        const vals = json.values || []
        setOptions(opts)
        const map: Record<string, Value[]> = {}
        for (const v of vals) {
          const optId = (v.option_id || v.optionId || v.option) as string
          if (!map[optId]) map[optId] = []
          map[optId].push(v)
        }
        setValuesMap(map)
      }

      // load variants via server endpoint
      const vres = await fetch(API_ENDPOINTS.admin(`variants&productId=${encodeURIComponent(productoId)}`))
      const vjson = await vres.json()
      if (!vres.ok) {
        console.error('Error fetching variants from server:', vjson)
        setVariants([])
      } else {
        setVariants(vjson.data || [])
      }
    } catch (err) {
      console.error('Error in loadOptions:', err)
      setOptions([])
      setValuesMap({})
      setVariants([])
    }
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

  const addValue = async (optionId: string, value: string, colorRaw?: string) => {
    // allow adding a named color and optionally a raw color value (hex or rgb)
    const v = (value || '').trim()
    if (!v && !colorRaw) return

    const normalizeHex = (input?: string) => {
      if (!input) return undefined
      const s = input.trim()
      const rgbMatch = s.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i)
      if (rgbMatch) {
        const r = Number(rgbMatch[1]), g = Number(rgbMatch[2]), b = Number(rgbMatch[3])
        const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`
      }
      if (/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(s)) return s
      return undefined
    }

    const hex = normalizeHex(colorRaw)
    const metadata = hex ? { hex } : null
    const insertValue = v || (hex || '')

    await supabaseAdmin
      .from('product_option_values')
      .insert([{ option_id: optionId, value: insertValue, metadata }])
      .select()
    loadOptions()
  }

  // helper: map some Spanish color names to hex and detect hex values
  const spanishColorMap: Record<string, string> = {
    rojo: '#ff0000',
    azul: '#007bff',
    verde: '#28a745',
    negro: '#000000',
    blanco: '#ffffff',
    amarillo: '#ffd400',
    naranja: '#ff7f00',
    morado: '#6f42c1',
    gris: '#6c757d',
    rosa: '#ff69b4',
    celeste: '#00bfff'
  }

  // Predefined lists (can be expanded) - inlined where used

  const getColorFromValue = (value: string) => {
    if (!value) return undefined
    const v = value.trim()
    // hex like #fff or #ffffff
    if (/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(v)) return v
    const key = v.toLowerCase()
    if (spanishColorMap[key]) return spanishColorMap[key]
    return undefined
  }

  const deleteOption = async (optionId: string) => {
    if (!confirm('¿Eliminar opción y todos sus valores? Esta acción no se puede deshacer.')) return
    setIsLoading(true)
    await supabaseAdmin.from('product_options').delete().eq('id', optionId)
    await loadOptions()
    setIsLoading(false)
  }

  const deleteValue = async (valueId: string) => {
    if (!confirm('¿Eliminar valor? Esta acción no se puede deshacer.')) return
    setIsLoading(true)
    await supabaseAdmin.from('product_option_values').delete().eq('id', valueId)
    await loadOptions()
    setIsLoading(false)
  }

  const generateVariants = async () => {
    // Simple generator: combine values across options and create variants.
    // Pricing rule: S/M same price, L = base + 1
    setIsLoading(true)

    // Fetch product base price and options/values from server endpoints
    let basePrice = 0
    try {
      const pRes = await fetch(API_ENDPOINTS.admin(`product-info&id=${encodeURIComponent(productoId)}`))
      const pjson = await pRes.json()
      if (pRes.ok && pjson.data) basePrice = pjson.data.precio || 0

      const optsRes = await fetch(API_ENDPOINTS.admin(`options&productId=${encodeURIComponent(productoId)}`))
      const optsJson = await optsRes.json()
  const opts = optsJson.options || []

      const localValuesMap: Record<string, Value[]> = {}
    const optionLists: Value[][] = []
    if (!opts || opts.length === 0) {
      alert('No hay valores para generar variantes')
      setIsLoading(false)
      return
    }

    for (const o of opts) {
      let vals = (localValuesMap[o.id] || []) as Value[]
      // If no values and option looks like size/talla, create S/M/L automatically
      const optName = (o.name || '').toString()
      if ((!vals || vals.length === 0) && /talla|size/i.test(optName)) {
        const toInsert = [
          { option_id: o.id, value: 'S' },
          { option_id: o.id, value: 'M' },
          { option_id: o.id, value: 'L' }
        ]
        // keep write via admin client for now
        const { error: insertValsErr } = await supabaseAdmin.from('product_option_values').insert(toInsert)
        if (insertValsErr) console.error('Error inserting default sizes', insertValsErr)
        // reload from server endpoint
        const reRes = await fetch(API_ENDPOINTS.admin(`options&productId=${encodeURIComponent(productoId)}`))
        const reJson = await reRes.json()
        const reVals = reJson.values || []
        vals = reVals.filter((v: any) => v.option_id === o.id)
      }
      const list = (vals || []) as Value[]
  localValuesMap[o.id] = list
  optionLists.push(list)
    }

    const combos: string[][] = [[]]
    for (const list of optionLists) {
      const next: string[][] = []
      for (const combo of combos) {
        for (const v of list) next.push([...combo, v.id])
      }
      combos.splice(0, combos.length, ...next)
    }

    // Avoid duplicates: fetch existing variants keys via server endpoint
    const evRes = await fetch(API_ENDPOINTS.admin(`variants&productId=${encodeURIComponent(productoId)}`))
    const evJson = await evRes.json()
    const existingVariants = evJson.data || []

    const existingSets = new Set((existingVariants || []).map((ev: any) => JSON.stringify((ev.option_value_ids || []).map(String).sort())))

    const inserts: any[] = []
    for (const combo of combos) {
      let price = basePrice
      // if any selected value is exactly 'L' (case-insensitive) then +1
      for (const optId of Object.keys(localValuesMap)) {
        const vals = localValuesMap[optId]
        for (const vid of combo) {
          const found = vals.find(v => v.id === vid)
          if (found && typeof found.value === 'string' && found.value.toUpperCase().trim() === 'L') {
            price = parseFloat((price + 1).toFixed(2))
          }
        }
      }

      const key = JSON.stringify(combo.map(String).sort())
      if (!existingSets.has(key)) {
        // Default stock left null so admin can fill per-variant stock; product-level sum will reflect variants when saved
        inserts.push({ product_id: productoId, price, stock: null, attributes: {}, option_value_ids: combo })
        existingSets.add(key)
      }
    }

    if (inserts.length > 0) {
      const { error: insertErr } = await supabaseAdmin.from('product_variants').insert(inserts)
      if (insertErr) console.error('Error inserting variants', insertErr)
    }

    await loadOptions()
    alert(`Variantes generadas (${inserts.length} nuevas)`)
    // do not auto-close parent modal; user can close explicitly
    } catch (err) {
      console.error('Error generating variants:', err)
      alert('Error al generar variantes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVariantChange = (id: string, field: string, value: any) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value, __dirty: true } : v))
  }

  const saveVariant = async (v: any) => {
    setIsLoading(true)
    const payload: any = {
      // SKU removed: store per-variant stock instead. Persist null when empty string.
      price: v.price === '' ? null : (v.price == null ? null : Number(v.price)),
      stock: v.stock === '' ? null : (v.stock == null ? null : Number(v.stock)),
      is_active: v.is_active,
      attributes: v.attributes || {}
    }
    await supabaseAdmin.from('product_variants').update(payload).eq('id', v.id)
    // mark saved locally
    setVariants(prev => prev.map(x => x.id === v.id ? { ...x, ...payload, __dirty: false } : x))
    await loadOptions()
    setIsLoading(false)
  }

  const saveAllVariants = async () => {
    const dirty = variants.filter(v => v.__dirty)
    if (!dirty || dirty.length === 0) return alert('No hay cambios pendientes para guardar')
    if (!confirm(`Guardar ${dirty.length} variantes con cambios?`)) return
    setIsLoading(true)
    try {
      const ops = dirty.map(v => {
        const rawPrice: any = (v as any).price
        const rawStock: any = (v as any).stock
        const payload: any = {
          price: (typeof rawPrice === 'string' && rawPrice.trim() === '') ? null : (rawPrice == null ? null : Number(rawPrice)),
          stock: (typeof rawStock === 'string' && rawStock.trim() === '') ? null : (rawStock == null ? null : Number(rawStock)),
          is_active: v.is_active,
          attributes: v.attributes || {}
        }
        return supabaseAdmin.from('product_variants').update(payload).eq('id', v.id).then(res => ({ res, id: v.id }))
      })
      const results = await Promise.all(ops)
      const errs = results.map(r => (r.res as any).error).filter(Boolean)
      if (errs.length) {
        console.error('Errores al guardar variantes', errs)
        alert('Algunas variantes no se pudieron guardar. Revisa la consola.')
      } else {
        // clear dirty flags for saved variants
        const savedIds = results.map(r => r.id)
        setVariants(prev => prev.map(v => savedIds.includes(v.id) ? { ...v, __dirty: false } : v))
        alert(`Guardadas ${results.length} variantes correctamente`)
      }
      await loadOptions()
    } catch (err) {
      console.error(err)
      alert('Error al guardar todas las variantes')
    } finally {
      setIsLoading(false)
    }
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
              <div>
                <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => deleteOption(opt.id)}>Eliminar opción</button>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex gap-2 items-center">
                {opt.name && typeof opt.name === 'string' && opt.name.toLowerCase() === 'color' ? (
                  <>
                    <input type="color" id={`val-${opt.id}`} className="w-12 h-10 p-0 border rounded" />
                    <input placeholder="Nombre (ej. Azul)" id={`val-name-${opt.id}`} className="input-field flex-1" />
                    <input placeholder="#hex o rgb(...) opcional" id={`val-raw-${opt.id}`} className="input-field w-48 ml-2" />
                    <button type="button" className="btn-secondary" onClick={() => {
                      const colorEl = document.getElementById(`val-${opt.id}`) as HTMLInputElement | null
                      const nameEl = document.getElementById(`val-name-${opt.id}`) as HTMLInputElement | null
                      const rawEl = document.getElementById(`val-raw-${opt.id}`) as HTMLInputElement | null
                      const raw = rawEl?.value?.trim()
                      const colorValue = raw || (colorEl ? colorEl.value : undefined)
                      const name = nameEl?.value?.trim() || ''
                      const insert = name || (colorValue || '')
                      addValue(opt.id, insert, colorValue)
                    }}>Agregar color</button>
                  </>
                ) : (
                  <>
                    <input placeholder="Nuevo valor (ej. S)" id={`val-${opt.id}`} className="input-field" />
                    <button type="button" className="btn-secondary" onClick={() => {
                      const el = document.getElementById(`val-${opt.id}`) as HTMLInputElement | null
                      if (el) addValue(opt.id, el.value)
                    }}>Agregar valor</button>
                  </>
                )}
              </div>
              <div className="mt-2 flex gap-2 flex-wrap items-center">
                {(valuesMap[opt.id] || []).map((v: any) => {
                  const metaHex = v.metadata?.hex
                  const color = metaHex || getColorFromValue(v.value)
                  const label = v.value
                  return (
                    <div key={v.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded shadow-sm border">
                      {color ? (
                        <span className="w-6 h-6 rounded border" style={{ backgroundColor: color }} />
                      ) : null}
                      <input
                        className="input-field w-40"
                        value={label}
                        onChange={(e) => {
                          // quick inline rename of the value (keeps metadata)
                          const newVal = e.target.value
                          supabaseAdmin.from('product_option_values').update({ value: newVal }).eq('id', v.id)
                            .then(() => loadOptions())
                        }}
                      />
                      <input
                        className="input-field w-28 ml-2"
                        placeholder="#hex or rgb(...)"
                        defaultValue={metaHex || ''}
                        onBlur={(e) => {
                          const raw = e.target.value.trim()
                          // normalize like addValue
                          const normalizeHex = (input?: string) => {
                            if (!input) return undefined
                            const s = input.trim()
                            const rgbMatch = s.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i)
                            if (rgbMatch) {
                              const r = Number(rgbMatch[1]), g = Number(rgbMatch[2]), b = Number(rgbMatch[3])
                              const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
                              return `#${toHex(r)}${toHex(g)}${toHex(b)}`
                            }
                            if (/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(s)) return s
                            return undefined
                          }
                          const hex = normalizeHex(raw)
                          const metadata = hex ? { hex } : null
                          supabaseAdmin.from('product_option_values').update({ metadata }).eq('id', v.id)
                            .then(() => loadOptions())
                        }}
                      />
                      <button type="button" className="text-sm text-red-500 hover:underline ml-2" onClick={() => deleteValue(v.id)}>Eliminar</button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Predefinidos: tallas y colores + guardar todo (no crea nuevos endpoints) */}
        <div className="border p-3 rounded mt-4">
          <h4 className="font-semibold mb-2">Predefinidos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Tallas</div>
              <div className="flex gap-2 flex-wrap">
                {['XS','S','M','L','XL','XXL'].map(sz => (
                  <button key={sz} type="button" onClick={() => setSizeSelections(prev => ({ ...prev, [sz]: !prev[sz] }))} className={`px-3 py-2 rounded-lg border transition-shadow ${sizeSelections[sz] ? 'bg-amarillo/10 ring-2 ring-amarillo' : 'bg-white hover:shadow-sm'}`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="hidden" checked={!!sizeSelections[sz]} readOnly />
                      <span className="text-sm font-medium">{sz}</span>
                    </label>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Colores</div>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(spanishColorMap).map(col => (
                  <button key={col} type="button" onClick={() => setColorSelections(prev => ({ ...prev, [col]: !prev[col] }))} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-shadow ${colorSelections[col] ? 'bg-amarillo/10 ring-2 ring-amarillo' : 'bg-white hover:shadow-sm'}`}>
                    <input type="checkbox" className="hidden" checked={!!colorSelections[col]} readOnly />
                    <span className="w-4 h-4 rounded border" style={{ backgroundColor: spanishColorMap[col] }} />
                    <span className="text-sm">{col}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t pt-3 flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoGenerateOnSave} onChange={(e) => setAutoGenerateOnSave(e.target.checked)} />
              Generar variantes automáticamente al Guardar todo (aplica regla S/M/L)
            </label>
            <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={async () => {
              setIsLoading(true)
              try {
                // (legacy quick-values removed) We only persist sizeSelections and colorSelections

                // 2) handle sizes: ensure option exists and values
                const sizeOpt = options.find(o => /talla|size/i.test(String(o.name)))
                let sizeOptionId = sizeOpt?.id
                if (!sizeOptionId) {
                  const name = 'Talla'
                  const { data: inserted } = await supabaseAdmin.from('product_options').insert([{ product_id: productoId, name }]).select().single()
                  sizeOptionId = inserted?.id
                  await loadOptions()
                }
                if (sizeOptionId) {
                  const { data: existingSizeVals } = await supabaseAdmin.from('product_option_values').select('id, value').eq('option_id', sizeOptionId)
                  const existingMap: Record<string, string> = {}
                  for (const r of (existingSizeVals || [])) existingMap[String(r.value).toUpperCase()] = r.id
                  const inserts: any[] = []
                  const updateTrue: string[] = []
                  const updateFalse: string[] = []
                  for (const sz of Object.keys(sizeSelections)) {
                    const upper = sz.toUpperCase()
                    if (existingMap[upper]) {
                      if (sizeSelections[sz]) updateTrue.push(existingMap[upper])
                      else updateFalse.push(existingMap[upper])
                    } else {
                      inserts.push({ option_id: sizeOptionId, value: sz, visible: !!sizeSelections[sz] })
                    }
                  }
                  if (inserts.length) await supabaseAdmin.from('product_option_values').insert(inserts)
                  if (updateTrue.length) await supabaseAdmin.from('product_option_values').update({ visible: true }).in('id', updateTrue)
                  if (updateFalse.length) await supabaseAdmin.from('product_option_values').update({ visible: false }).in('id', updateFalse)
                }

                // 3) colors
                const colorOpt = options.find(o => /color/i.test(String(o.name)))
                let colorOptionId = colorOpt?.id
                if (!colorOptionId) {
                  const name = 'Color'
                  const { data: inserted } = await supabaseAdmin.from('product_options').insert([{ product_id: productoId, name }]).select().single()
                  colorOptionId = inserted?.id
                  await loadOptions()
                }
                if (colorOptionId) {
                  const { data: existingColorVals } = await supabaseAdmin.from('product_option_values').select('id, value, metadata').eq('option_id', colorOptionId)
                  const existingMap: Record<string, any> = {}
                  for (const r of (existingColorVals || [])) existingMap[String(r.value).toLowerCase()] = r
                  const insertsC: any[] = []
                  const upTrueC: string[] = []
                  const upFalseC: string[] = []
                  for (const col of Object.keys(colorSelections)) {
                    const lower = col.toLowerCase()
                    const hex = spanishColorMap[col]
                    if (existingMap[lower]) {
                      if (colorSelections[col]) upTrueC.push(existingMap[lower].id)
                      else upFalseC.push(existingMap[lower].id)
                    } else {
                      insertsC.push({ option_id: colorOptionId, value: col, metadata: hex ? { hex } : null, visible: !!colorSelections[col] })
                    }
                  }
                  if (insertsC.length) await supabaseAdmin.from('product_option_values').insert(insertsC)
                  if (upTrueC.length) await supabaseAdmin.from('product_option_values').update({ visible: true }).in('id', upTrueC)
                  if (upFalseC.length) await supabaseAdmin.from('product_option_values').update({ visible: false }).in('id', upFalseC)
                }

                await loadOptions()
                alert('Guardado exitoso')
                // optionally auto-generate variants according to S/M/L rule
                if (autoGenerateOnSave) {
                  await generateVariants()
                }
              } catch (err) {
                console.error(err)
                alert('Error al guardar. Revisa la consola.')
              } finally {
                setIsLoading(false)
              }
            }}>Guardar todo</button>

            <button className="btn-secondary" onClick={() => { setSizeSelections({}); setColorSelections({}) }}>Reset</button>
            </div>
          </div>
        </div>

        {/* Quick-values removed to simplify UI; Predefinidos handled above with sizeSelections/colorSelections */}

        <div className="pt-4">
          <button className="btn-primary" onClick={generateVariants} disabled={isLoading}>Generar variantes automáticas (aplica regla S/M/L)</button>
        </div>

        {/* Variants list */}
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Variantes existentes</h4>
          {variants.length === 0 && <p className="text-sm text-gray-500">No hay variantes aún.</p>}
          {variants.map(v => {
            // build human readable label from option_value_ids
            const comboIds: string[] = (v.option_value_ids || []).map(String)
            const comboParts: string[] = []
            for (const opt of options) {
              const foundId = comboIds.find(id => (valuesMap[opt.id] || []).some((val: any) => String(val.id) === String(id)))
              if (foundId) {
                const foundVal = (valuesMap[opt.id] || []).find((val: any) => String(val.id) === String(foundId))
                if (foundVal) comboParts.push(`${opt.name}: ${foundVal.value}`)
              }
            }
            const comboLabel = comboParts.join(' / ')

            // detect color option id (if any)
            const colorOption = options.find(o => typeof o.name === 'string' && /color/i.test(o.name))
            let currentColorValueId: string | null = null
            if (colorOption) {
              currentColorValueId = comboIds.find(id => (valuesMap[colorOption.id] || []).some((val: any) => String(val.id) === String(id))) || null
            }

            return (
              <div key={v.id} className="flex items-center gap-2 mb-3 p-2 rounded border">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">{comboLabel || '—'}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-28">
                      <input type="number" className="input-field" value={v.stock != null ? v.stock : ''} onChange={(e) => {
                        const val = e.target.value
                        handleVariantChange(v.id, 'stock', val === '' ? '' : parseInt(val))
                      }} placeholder="Stock" />
                    </div>
                    <div className="w-32">
                      <input type="number" className="input-field" value={v.price ?? ''} onChange={(e) => {
                        const val = e.target.value
                        handleVariantChange(v.id, 'price', val === '' ? '' : parseFloat(val))
                      }} placeholder="Precio" />
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!v.is_active} onChange={(e) => handleVariantChange(v.id, 'is_active', e.target.checked)} /> Activa
                    </label>
                    {colorOption && (
                      <div className="flex items-center gap-2">
                        <select value={currentColorValueId || ''} onChange={async (e) => {
                          const newValId = e.target.value
                          if (!newValId) return
                          // update variant option_value_ids replacing color value id
                          const newIds = (v.option_value_ids || []).map((id: any) => String(id))
                          const idx = newIds.findIndex((id: string) => (valuesMap[colorOption.id] || []).some((val: any) => String(val.id) === String(id)))
                          if (idx >= 0) newIds[idx] = newValId
                          else newIds.push(newValId)
                          await supabaseAdmin.from('product_variants').update({ option_value_ids: newIds }).eq('id', v.id)
                          await loadOptions()
                        }} className="input-field">
                          <option value="">(sin color)</option>
                          {(valuesMap[colorOption.id] || []).map((val: any) => (
                            <option key={val.id} value={String(val.id)}>{val.value}</option>
                          ))}
                        </select>
                        {/* color picker to edit metadata.hex of the currently selected value */}
                        {currentColorValueId && (
                          <input type="color" className="w-10 h-10 rounded border" value={(valuesMap[colorOption.id] || []).find((vv: any) => String(vv.id) === String(currentColorValueId))?.metadata?.hex || '#ffffff'} onChange={async (e) => {
                            const hex = e.target.value
                            const valId = currentColorValueId
                            if (!valId) return
                            await supabaseAdmin.from('product_option_values').update({ metadata: { hex } }).eq('id', valId)
                            await loadOptions()
                          }} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary" onClick={() => saveVariant(v)} disabled={isLoading}>Guardar</button>
                  <button className="btn-danger" onClick={() => deleteVariant(v.id)} disabled={isLoading}>Eliminar</button>
                </div>
              </div>
            )
          })}
          <div className="mt-4 flex gap-2">
            <button className="btn-primary" onClick={saveAllVariants} disabled={isLoading}>Guardar todos</button>
            <button className="btn-secondary" onClick={() => loadOptions()} disabled={isLoading}>Refrescar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
