import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Option = { id: string; name: string; position: number }
type Value = { id: string; value: string; position: number; metadata?: any }

export default function VariantsEditor({ productoId }: { productoId: string }) {
  const [options, setOptions] = useState<Option[]>([])
  const [valuesMap, setValuesMap] = useState<Record<string, Value[]>>({})
  const [quickSelectedValues, setQuickSelectedValues] = useState<Record<string, boolean>>({})
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
    // reset quick selection when options change
    const quick: Record<string, boolean> = {}
    for (const k of Object.keys(map)) {
      for (const v of map[k] || []) quick[String(v.id)] = false
    }
    setQuickSelectedValues(quick)
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

  // Predefined lists (can be expanded)
  const PREDEF_SIZES = ['XS','S','M','L','XL','XXL']
  const PREDEF_COLORS = Object.keys(spanishColorMap).map(k => ({ name: k, hex: spanishColorMap[k] }))

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

    // Fetch product base price
    const { data: product, error: _prodErr } = await supabaseAdmin.from('productos').select('id, precio').eq('id', productoId).single()
    const basePrice = product?.precio || 0

    // Fetch fresh options and values from DB to avoid stale state
    const { data: opts } = await supabaseAdmin
      .from('product_options')
      .select('id, name')
      .eq('product_id', productoId)
      .order('position', { ascending: true })

    const localValuesMap: Record<string, Value[]> = {}
    const optionLists: Value[][] = []
    if (!opts || opts.length === 0) {
      alert('No hay valores para generar variantes')
      setIsLoading(false)
      return
    }

    for (const o of opts) {
      let { data: vals } = await supabaseAdmin
        .from('product_option_values')
        .select('id, value')
        .eq('option_id', o.id)
        .order('position', { ascending: true })
      // If no values and option looks like size/talla, create S/M/L automatically
      const optName = (o.name || '').toString()
      if ((!vals || vals.length === 0) && /talla|size/i.test(optName)) {
        const toInsert = [
          { option_id: o.id, value: 'S' },
          { option_id: o.id, value: 'M' },
          { option_id: o.id, value: 'L' }
        ]
        const { error: insertValsErr } = await supabaseAdmin.from('product_option_values').insert(toInsert)
        if (insertValsErr) console.error('Error inserting default sizes', insertValsErr)
        const re = await supabaseAdmin
          .from('product_option_values')
          .select('id, value')
          .eq('option_id', o.id)
          .order('position', { ascending: true })
        vals = re.data
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

    // Avoid duplicates: fetch existing variants keys
    const { data: existingVariants } = await supabaseAdmin
      .from('product_variants')
      .select('id, option_value_ids')
      .eq('product_id', productoId)

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

    setIsLoading(false)
    await loadOptions()
    alert(`Variantes generadas (${inserts.length} nuevas)`)
    // do not auto-close parent modal; user can close explicitly
  }

  const handleVariantChange = (id: string, field: string, value: any) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
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

        {/* Quick-values panel: show all values grouped by option with toggles */}
        <div className="border p-3 rounded mt-4">
          <h4 className="font-semibold mb-2">Valores rápidos</h4>
          <div className="flex gap-4 flex-wrap">
            {Object.keys(valuesMap).map(optId => (
              <div key={optId} className="min-w-[180px]">
                <div className="text-sm font-medium mb-1">{(options.find(o => o.id === optId) || { name: '' }).name}</div>
                <div className="flex flex-col gap-2">
                  {(valuesMap[optId] || []).map(v => (
                    <label key={v.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={!!quickSelectedValues[String(v.id)]} onChange={(e) => setQuickSelectedValues(prev => ({ ...prev, [String(v.id)]: e.target.checked }))} />
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 rounded" style={{ backgroundColor: v.metadata?.hex || getColorFromValue(v.value) }} />
                        <span className="text-sm">{v.value}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Predefinidos</div>
            <div className="flex gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Tallas</div>
                <div className="flex gap-2 flex-wrap">
                  {PREDEF_SIZES.map(s => (
                    <label key={s} className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!quickSelectedValues[`size:${s}`]} onChange={(e) => setQuickSelectedValues(prev => ({ ...prev, [`size:${s}`]: e.target.checked }))} />
                      <span className="px-2 py-1 border rounded text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Colores</div>
                <div className="flex gap-2 flex-wrap items-center">
                  {PREDEF_COLORS.map(c => (
                    <label key={c.name} className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!quickSelectedValues[`color:${c.name}`]} onChange={(e) => setQuickSelectedValues(prev => ({ ...prev, [`color:${c.name}`]: e.target.checked }))} />
                      <span className="w-6 h-6 rounded border" style={{ backgroundColor: c.hex }} />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
            <div className="mt-3 flex gap-2">
            <button className="btn-primary" onClick={async () => {
              // Build a batch of updates/creates and POST to admin endpoint for atomic handling
              setIsLoading(true)
              try {
                const updates: any[] = []
                // For each option, look for size/color semantics
                for (const opt of options) {
                  const isSize = /talla|size/i.test(String(opt.name))
                  const isColor = /color/i.test(String(opt.name))
                  if (isSize) {
                    for (const s of PREDEF_SIZES) {
                      const key = `size:${s}`
                      const shouldExist = !!quickSelectedValues[key]
                      const existing = (valuesMap[opt.id] || []).find(v => String(v.value).toUpperCase() === String(s).toUpperCase())
                      if (shouldExist) {
                        if (!existing) {
                          updates.push({ create: { option_id: opt.id, value: s, visible: true } })
                        } else {
                          updates.push({ id: existing.id, visible: true })
                        }
                      } else {
                        if (existing) updates.push({ id: existing.id, visible: false })
                      }
                    }
                  }
                  if (isColor) {
                    for (const c of PREDEF_COLORS) {
                      const key = `color:${c.name}`
                      const shouldExist = !!quickSelectedValues[key]
                      const existing = (valuesMap[opt.id] || []).find(v => String(v.value).toLowerCase() === String(c.name).toLowerCase() || (v.metadata && v.metadata.hex && String(v.metadata.hex).toLowerCase() === String(c.hex).toLowerCase()))
                      if (shouldExist) {
                        if (!existing) {
                          updates.push({ create: { option_id: opt.id, value: c.name, visible: true, metadata: { hex: c.hex } } })
                        } else {
                          updates.push({ id: existing.id, visible: true, metadata: { ...(existing.metadata || {}), hex: c.hex } })
                        }
                      } else {
                        if (existing) updates.push({ id: existing.id, visible: false })
                      }
                    }
                  }
                }

                // Normalize into payload: existing updates and creations separated
                const payloadUpdates: any[] = []
                const payloadCreates: any[] = []
                for (const u of updates) {
                  if ((u as any).create) payloadCreates.push((u as any).create)
                  else payloadUpdates.push(u)
                }

                // First, create new values via supabaseAdmin directly (we need the new ids)
                if (payloadCreates.length > 0) {
                  await supabaseAdmin.from('product_option_values').insert(payloadCreates)
                }

                // Now, use the admin batch API to update existing ones (visible/metadata)
                if (payloadUpdates.length > 0) {
                  // map to the endpoint's expected shape
                  const body = { updates: payloadUpdates.map(u => ({ id: u.id, visible: u.visible, metadata: u.metadata })) }
                  const resp = await fetch('/api/admin/option-values/batch-update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                  if (!resp.ok) throw new Error('Batch update failed')
                }

                await loadOptions()
                alert('Guardado de predefinidos completado')
              } catch (err) {
                console.error(err)
                alert('Error al guardar predefinidos')
              } finally {
                setIsLoading(false)
              }
            }}>Activar seleccionadas</button>
            <button className="btn-secondary" onClick={async () => {
              const checked = Object.keys(quickSelectedValues).filter(k => quickSelectedValues[k])
              if (checked.length === 0) return alert('Selecciona al menos un valor')
              setIsLoading(true)
              try {
                const updates: any[] = []
                for (const k of checked) {
                  const [type, raw] = k.split(':')
                  for (const opt of options) {
                    const vals = valuesMap[opt.id] || []
                    if (/talla|size/i.test(String(opt.name)) && type === 'size') {
                      const ex = vals.find(v => String(v.value).toUpperCase() === raw.toUpperCase())
                      if (ex) updates.push({ id: ex.id, visible: false })
                    }
                    if (/color/i.test(String(opt.name)) && type === 'color') {
                      const ex = vals.find(v => String(v.value).toLowerCase() === raw.toLowerCase() || (v.metadata && v.metadata.hex && String(v.metadata.hex).toLowerCase() === String(raw).toLowerCase()))
                      if (ex) updates.push({ id: ex.id, visible: false })
                    }
                  }
                }
                if (updates.length > 0) {
                  const resp = await fetch('/api/admin/option-values/batch-update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates }) })
                  if (!resp.ok) throw new Error('Batch update failed')
                }
                await loadOptions()
                alert('Desactivado para seleccionados')
              } catch (err) {
                console.error(err)
                alert('Error al desactivar')
              } finally {
                setIsLoading(false)
              }
            }}>Desactivar seleccionadas</button>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  )
}
