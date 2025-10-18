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

  return (
    <div className="space-y-4">
      {options.map((opt) => (
        <div key={opt.id}>
          <label className="block text-sm font-medium text-gray-700">{opt.name}</label>
          <div className="mt-2 flex items-center gap-2">
            {opt.values.map(v => (
              <button
                key={v.id}
                onClick={() => setSelected(prev => ({ ...prev, [opt.id]: v.id }))}
                className={`px-3 py-1 border rounded ${selected[opt.id] === v.id ? 'border-amarillo bg-amarillo/20' : 'border-gray-200'}`}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
