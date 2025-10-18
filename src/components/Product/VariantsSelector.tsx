import { useMemo, useState, useEffect } from 'react'

type Option = { id: string; name: string; values: { id: string; value: string }[] }
type Variant = { id: string; price?: number; stock: number; option_value_ids: string[]; attributes: any }

type Props = {
  options: Option[]
  variants: Variant[]
  onVariantChange?: (variant: Variant | null) => void
}

export default function VariantsSelector({ options = [], variants = [], onVariantChange }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({})

  useEffect(() => {
    // initialize with first value of each option
    const init: Record<string,string> = {}
    options.forEach((opt) => {
      if (opt.values && opt.values.length) init[opt.id] = opt.values[0].id
    })
    setSelected(init)
  }, [options])

  const matchingVariant = useMemo(() => {
    if (!variants || variants.length === 0) return null
    const selectedIds = Object.values(selected).map(String).sort()
    return variants.find((v) => {
      const ids = (v.option_value_ids || []).map(String).sort()
      return JSON.stringify(ids) === JSON.stringify(selectedIds)
    }) || null
  }, [selected, variants])

  useEffect(() => { if (onVariantChange) onVariantChange(matchingVariant) }, [matchingVariant, onVariantChange])

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

  const parseColorValue = (value: string) => {
    if (!value) return { name: value, hex: undefined }
    const v = value.trim()
    // find hex in value
    const hexMatch = v.match(/#([0-9A-F]{3}|[0-9A-F]{6})/i)
    if (hexMatch) {
      const hex = hexMatch[0]
      // name is value without hex
      const name = v.replace(hexMatch[0], '').trim()
      return { name: name || undefined, hex }
    }
    const lower = v.toLowerCase()
    if (spanishColorMap[lower]) return { name: v, hex: spanishColorMap[lower] }
    return { name: v, hex: undefined }
  }

  // compute stock per option value by summing variant.stock where variant.option_value_ids includes the value id
  const stockByValue: Record<string, number> = {}
  for (const variant of variants || []) {
    const s = Number(variant.stock || 0)
    const ids: string[] = (variant.option_value_ids || []).map(String)
    for (const id of ids) {
      stockByValue[id] = (stockByValue[id] || 0) + (isNaN(s) ? 0 : s)
    }
  }

  return (
    <div className="space-y-4">
      {options.map((opt) => (
        <div key={opt.id}>
          <label className="block text-sm font-medium text-gray-700">{opt.name}</label>
          <div className="mt-2 flex items-center gap-2">
                {opt.values.map(v => {
              const isColorOption = typeof opt.name === 'string' && /color/i.test(opt.name)
              if (isColorOption) {
                const { name, hex } = parseColorValue(v.value)
                    const stock = stockByValue[v.id] || 0
                    const disabled = stock <= 0
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelected(prev => ({ ...prev, [opt.id]: v.id }))}
                        aria-label={`Seleccionar ${name || v.value}`}
                        className={`flex items-center gap-2 px-2 py-1 border rounded ${selected[opt.id] === v.id ? 'border-amarillo bg-amarillo/20' : 'border-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={disabled}
                      >
                        <span className="w-6 h-6 rounded" style={{ backgroundColor: hex || name || v.value }} />
                        <span>{name || v.value}</span>
                        {stock > 0 && <span className="ml-2 text-xs text-gray-600">{stock}</span>}
                      </button>
                    )
              }
              const looksLikeHex = typeof v.value === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(v.value.trim())
              if (looksLikeHex) {
                const { name, hex } = parseColorValue(v.value)
                    const stock = stockByValue[v.id] || 0
                    const disabled = stock <= 0
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelected(prev => ({ ...prev, [opt.id]: v.id }))}
                        aria-label={`Seleccionar ${name || v.value}`}
                        className={`flex items-center gap-2 px-2 py-1 border rounded ${selected[opt.id] === v.id ? 'border-amarillo bg-amarillo/20' : 'border-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={disabled}
                      >
                        <span className="w-6 h-6 rounded" style={{ backgroundColor: hex || v.value }} />
                        <span>{name || v.value}</span>
                        {stock > 0 && <span className="ml-2 text-xs text-gray-600">{stock}</span>}
                      </button>
                    )
              }
                const stock = stockByValue[v.id] || 0
                const disabled = stock <= 0
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelected(prev => ({ ...prev, [opt.id]: v.id }))}
                    className={`px-3 py-1 border rounded ${selected[opt.id] === v.id ? 'border-amarillo bg-amarillo/20' : 'border-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={disabled}
                  >
                    {v.value}
                    {stock > 0 && <span className="ml-2 text-xs text-gray-600">{stock}</span>}
                  </button>
                )
                })}
          </div>
        </div>
      ))}
    </div>
  )
}
