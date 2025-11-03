/**
 * VariantsEditorNew - Sistema mejorado de gestión de variantes
 * Versión: 2.0 - Refactorizado para usar backend API exclusivamente
 * Última actualización: 2025-11-02
 */
import { useEffect, useState } from 'react'
import { fetchAdmin } from '../../lib/adminApi'
import { Plus, Trash2, RefreshCw, Package, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

interface Option {
  id: string
  name: string
  position: number
}

interface OptionValue {
  id: string
  option_id: string
  value: string
  position: number
  metadata?: { hex?: string }
  visible?: boolean
}

interface Variant {
  id: string
  product_id: string
  price: number | null
  stock: number | null
  is_active: boolean
  sku: string | null
  option_value_ids: string[]
  variante_nombre?: string
  opciones_detalle?: Array<{
    option_name: string
    option_value: string
    value_id: string
    metadata?: { hex?: string }
  }>
}

interface VariantsEditorNewProps {
  productoId: string
}

export default function VariantsEditorNew({ productoId }: VariantsEditorNewProps) {
  const [currentStep, setCurrentStep] = useState<'options' | 'values' | 'variants'>('options')
  const [options, setOptions] = useState<Option[]>([])
  const [optionValues, setOptionValues] = useState<Record<string, OptionValue[]>>({})
  const [variants, setVariants] = useState<Variant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [basePrice, setBasePrice] = useState(0)
  const [newOptionName, setNewOptionName] = useState('')
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({})
  
  useEffect(() => {
    loadData()
  }, [productoId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar precio base del producto
      const productResponse = await fetchAdmin(`product-info&id=${encodeURIComponent(productoId)}`)
      if (productResponse.data) {
        setBasePrice(productResponse.data.precio || 0)
      }

      // Cargar opciones y valores
      const optionsResponse = await fetchAdmin(`options&productId=${encodeURIComponent(productoId)}`)
      const opts = optionsResponse.options || []
      const vals = optionsResponse.values || []
      
      setOptions(opts)
      
      // Organizar valores por opción
      const valuesMap: Record<string, OptionValue[]> = {}
      vals.forEach((val: OptionValue) => {
        const optId = val.option_id
        if (!valuesMap[optId]) valuesMap[optId] = []
        valuesMap[optId].push(val)
      })
      setOptionValues(valuesMap)

      // Cargar variantes usando la nueva vista SQL a través del backend
      const variantsResponse = await fetchAdmin(`get-variants&product_id=${productoId}`, {
        method: 'GET'
      })
      
      if (variantsResponse.error) {
        console.error('Error loading variants:', variantsResponse.error)
        setVariants([])
      } else {
        setVariants(variantsResponse.data || [])
      }
    } catch (error) {
      console.error('Error in loadData:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // PASO 1: GESTIÓN DE OPCIONES
  // ============================================
  const createOption = async () => {
    if (!newOptionName.trim()) return
    
    setIsLoading(true)
    try {
      // Usar endpoint admin en lugar de supabaseAdmin directo
      const response = await fetchAdmin('create-option', {
        method: 'POST',
        body: JSON.stringify({ 
          product_id: productoId, 
          name: newOptionName,
          position: options.length 
        })
      })
      
      if (response.error) throw new Error(response.error)
      
      // Recargar datos completos
      await loadData()
      setNewOptionName('')
      alert(`✅ Opción "${newOptionName}" creada exitosamente`)
    } catch (error) {
      console.error('Error creating option:', error)
      alert('❌ Error al crear opción: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteOption = async (optionId: string) => {
    if (!confirm('¿Eliminar esta opción y todos sus valores? Las variantes que usen esta opción también se eliminarán.')) return
    
    setIsLoading(true)
    try {
      const response = await fetchAdmin('delete-option', {
        method: 'DELETE',
        body: JSON.stringify({ option_id: optionId })
      })
      
      if (response.error) throw new Error(response.error)
      
      await loadData()
      alert('✅ Opción eliminada')
    } catch (error) {
      console.error('Error deleting option:', error)
      alert('❌ Error al eliminar opción: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // PASO 2: GESTIÓN DE VALORES
  // ============================================
  const addOptionValue = async (optionId: string) => {
    const value = newValueInputs[optionId]?.trim()
    if (!value) return
    
    setIsLoading(true)
    try {
      const option = options.find(o => o.id === optionId)
      const isColorOption = option?.name.toLowerCase().includes('color')
      
      // Si es color, intentar extraer hex
      let metadata = null
      if (isColorOption) {
        const hexMatch = value.match(/#([0-9A-F]{6}|[0-9A-F]{3})/i)
        if (hexMatch) {
          metadata = { hex: hexMatch[0] }
        }
      }
      
      const response = await fetchAdmin('create-option-value', {
        method: 'POST',
        body: JSON.stringify({ 
          option_id: optionId, 
          value,
          metadata,
          position: (optionValues[optionId]?.length || 0),
          visible: true
        })
      })
      
      if (response.error) throw new Error(response.error)
      
      // Recargar datos
      await loadData()
      setNewValueInputs({ ...newValueInputs, [optionId]: '' })
      alert(`✅ Valor "${value}" agregado`)
    } catch (error) {
      console.error('Error adding value:', error)
      alert('❌ Error al agregar valor: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteOptionValue = async (valueId: string) => {
    if (!confirm('¿Eliminar este valor? Las variantes que lo usen también se eliminarán.')) return
    
    setIsLoading(true)
    try {
      const response = await fetchAdmin('delete-option-value', {
        method: 'DELETE',
        body: JSON.stringify({ value_id: valueId })
      })
      
      if (response.error) throw new Error(response.error)
      
      await loadData()
      alert('✅ Valor eliminado')
    } catch (error) {
      console.error('Error deleting value:', error)
      alert('❌ Error al eliminar valor: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleValueVisibility = async (valueId: string, optionId: string, currentVisible: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetchAdmin('update-option-value-visibility', {
        method: 'PATCH',
        body: JSON.stringify({ value_id: valueId, visible: !currentVisible })
      })
      
      if (response.error) throw new Error(response.error)
      
      // Actualizar estado local
      setOptionValues({
        ...optionValues,
        [optionId]: optionValues[optionId].map(v => 
          v.id === valueId ? { ...v, visible: !currentVisible } : v
        )
      })
    } catch (error) {
      console.error('Error toggling visibility:', error)
      alert('❌ Error al cambiar visibilidad: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // PASO 3: GENERACIÓN Y GESTIÓN DE VARIANTES
  // ============================================
  const generateAllVariants = async () => {
    if (options.length === 0) {
      alert('Debes crear al menos una opción (ej: Talla) antes de generar variantes')
      return
    }
    
    const hasVisibleValues = Object.values(optionValues).some(vals => 
      vals.some(v => v.visible !== false)
    )
    
    if (!hasVisibleValues) {
      alert('Debes tener al menos un valor visible en alguna opción')
      return
    }
    
    if (!confirm('Se generarán todas las combinaciones posibles de variantes. ¿Continuar?')) return
    
    setIsLoading(true)
    try {
      const response = await fetchAdmin('generate-variants', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productoId,
          options: options.map(opt => ({
            id: opt.id,
            values: (optionValues[opt.id] || [])
              .filter(v => v.visible !== false)
              .map(v => v.id)
          })),
          base_price: basePrice
        })
      })
      
      if (response.error) throw new Error(response.error)
      
      const count = response.data?.count || 0
      alert(`✅ Se generaron ${count} variantes nuevas`)
      
      await loadData()
    } catch (error) {
      console.error('Error generating variants:', error)
      alert('❌ Error al generar variantes: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateVariant = async (variantId: string, field: string, value: any) => {
    setIsLoading(true)
    try {
      const response = await fetchAdmin('update-variant', {
        method: 'PATCH',
        body: JSON.stringify({ variant_id: variantId, field, value })
      })
      
      if (response.error) throw new Error(response.error)
      
      // Actualizar estado local
      setVariants(variants.map(v => 
        v.id === variantId ? { ...v, [field]: value } : v
      ))
    } catch (error) {
      console.error('Error updating variant:', error)
      alert('❌ Error al actualizar variante: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteVariant = async (variantId: string) => {
    if (!confirm('¿Eliminar esta variante?')) return
    
    setIsLoading(true)
    try {
      const response = await fetchAdmin('delete-variant', {
        method: 'DELETE',
        body: JSON.stringify({ variant_id: variantId })
      })
      
      if (response.error) throw new Error(response.error)
      
      setVariants(variants.filter(v => v.id !== variantId))
    } catch (error) {
      console.error('Error deleting variant:', error)
      alert('❌ Error al eliminar variante: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // PLANTILLAS RÁPIDAS
  // ============================================
  const applyQuickTemplate = async (template: 'ropa' | 'calzado') => {
    if (!confirm('Esto creará opciones y valores predefinidos. ¿Continuar?')) return
    
    setIsLoading(true)
    try {
      console.log('[VariantsEditor] Aplicando plantilla:', template, 'para producto:', productoId)
      
      if (template === 'ropa') {
        // Crear opción Talla
        console.log('[VariantsEditor] Creando opción Talla...')
        const tallaResponse = await fetchAdmin('create-option', {
          method: 'POST',
          body: JSON.stringify({
            product_id: productoId,
            name: 'Talla',
            position: 0
          })
        })
        
        console.log('[VariantsEditor] Respuesta create-option:', tallaResponse)
        if (tallaResponse.error) throw new Error(tallaResponse.error)
        const tallaOptId = tallaResponse.data.id
        
        // Crear valores de talla
        const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        console.log('[VariantsEditor] Creando', tallas.length, 'valores de talla...')
        for (let i = 0; i < tallas.length; i++) {
          const valueResponse = await fetchAdmin('create-option-value', {
            method: 'POST',
            body: JSON.stringify({
              option_id: tallaOptId,
              value: tallas[i],
              position: i,
              visible: true
            })
          })
          if (valueResponse.error) throw new Error(valueResponse.error)
        }
        
        // Crear opción Color
        const colorResponse = await fetchAdmin('create-option', {
          method: 'POST',
          body: JSON.stringify({
            product_id: productoId,
            name: 'Color',
            position: 1
          })
        })
        
        if (colorResponse.error) throw new Error(colorResponse.error)
        const colorOptId = colorResponse.data.id
        
        // Crear valores de color
        const colores = [
          { value: 'Negro', hex: '#000000' },
          { value: 'Blanco', hex: '#ffffff' },
          { value: 'Azul', hex: '#007bff' },
          { value: 'Rojo', hex: '#dc3545' }
        ]
        for (let i = 0; i < colores.length; i++) {
          const valueResponse = await fetchAdmin('create-option-value', {
            method: 'POST',
            body: JSON.stringify({
              option_id: colorOptId,
              value: colores[i].value,
              metadata: { hex: colores[i].hex },
              position: i,
              visible: true
            })
          })
          if (valueResponse.error) throw new Error(valueResponse.error)
        }
      }
      
      // Recargar datos
      await loadData()
      
      // Cambiar automáticamente al paso 2 para que vea los valores
      setCurrentStep('values')
      
      alert('✅ Plantilla aplicada exitosamente!\n\n- Opción "Talla" creada con 6 valores (XS-XXL)\n- Opción "Color" creada con 4 valores\n\nAhora puedes ir al Paso 3 para generar las variantes.')
    } catch (error) {
      console.error('Error applying template:', error)
      alert('❌ Error al aplicar plantilla: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // RENDERIZADO
  // ============================================
  return (
    <div className="space-y-6">
      {/* Navegación por pasos */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentStep('options')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 'options'
                ? 'bg-amarillo text-gris-oscuro'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            1. Opciones
          </button>
          <button
            onClick={() => setCurrentStep('values')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 'values'
                ? 'bg-amarillo text-gris-oscuro'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            2. Valores
          </button>
          <button
            onClick={() => setCurrentStep('variants')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 'variants'
                ? 'bg-amarillo text-gris-oscuro'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            3. Inventario
          </button>
        </div>
        
        <button
          onClick={loadData}
          disabled={isLoading}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* PASO 1: OPCIONES */}
      {currentStep === 'options' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 ¿Qué son las Opciones?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Las opciones son las características que varían en tu producto. Por ejemplo: Talla, Color, Material, etc.
            </p>
          </div>

          {/* Plantillas rápidas */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-3">🚀 Plantillas Rápidas</h4>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amarillo mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Creando opciones y valores...</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={() => applyQuickTemplate('ropa')}
                    disabled={isLoading || options.length > 0}
                    className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    👕 Ropa (Talla + Color)
                  </button>
                </div>
                {options.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    * Las plantillas solo están disponibles cuando no hay opciones creadas
                  </p>
                )}
              </>
            )}
          </div>

          {/* Crear nueva opción */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-3">➕ Crear Nueva Opción</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createOption()}
                placeholder="Ej: Talla, Color, Material..."
                className="input-field flex-1"
              />
              <button
                onClick={createOption}
                disabled={!newOptionName.trim() || isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear</span>
              </button>
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-3">📝 Opciones Creadas ({options.length})</h4>
            {options.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay opciones aún. Crea una opción o usa una plantilla rápida.
              </p>
            ) : (
              <div className="space-y-2">
                {options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{option.name}</p>
                      <p className="text-sm text-gray-500">
                        {optionValues[option.id]?.length || 0} valores
                      </p>
                    </div>
                    <button
                      onClick={() => deleteOption(option.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {options.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('values')}
                className="btn-primary"
              >
                Siguiente: Agregar Valores →
              </button>
            </div>
          )}
        </div>
      )}

      {/* PASO 2: VALORES */}
      {currentStep === 'values' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎨 ¿Qué son los Valores?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Los valores son las opciones específicas que ofreces. Por ejemplo, para "Talla": S, M, L, XL.
              Para "Color" puedes usar nombres o códigos hex (#ff0000).
            </p>
          </div>

          {options.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Primero debes crear opciones</p>
              <button
                onClick={() => setCurrentStep('options')}
                className="btn-primary"
              >
                ← Ir a Opciones
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <h4 className="font-semibold mb-3">{option.name}</h4>
                  
                  {/* Agregar valor */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newValueInputs[option.id] || ''}
                      onChange={(e) => setNewValueInputs({
                        ...newValueInputs,
                        [option.id]: e.target.value
                      })}
                      onKeyPress={(e) => e.key === 'Enter' && addOptionValue(option.id)}
                      placeholder={
                        option.name.toLowerCase().includes('color')
                          ? 'Ej: Rojo, #ff0000, Negro...'
                          : `Ej: ${option.name === 'Talla' ? 'S, M, L' : 'Valor'}`
                      }
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => addOptionValue(option.id)}
                      disabled={!newValueInputs[option.id]?.trim() || isLoading}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>

                  {/* Lista de valores */}
                  <div className="flex flex-wrap gap-2">
                    {(optionValues[option.id] || []).map((value) => {
                      const isColor = option.name.toLowerCase().includes('color')
                      const hexColor = value.metadata?.hex
                      
                      return (
                        <div
                          key={value.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                            value.visible === false
                              ? 'bg-gray-100 dark:bg-gray-700 opacity-50'
                              : 'bg-white dark:bg-gray-800'
                          }`}
                        >
                          {isColor && hexColor && (
                            <span
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: hexColor }}
                            />
                          )}
                          <span className="text-sm font-medium">{value.value}</span>
                          <button
                            onClick={() => toggleValueVisibility(value.id, option.id, value.visible !== false)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title={value.visible === false ? 'Mostrar' : 'Ocultar'}
                          >
                            {value.visible === false ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteOptionValue(value.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                    {(optionValues[option.id] || []).length === 0 && (
                      <p className="text-sm text-gray-500 w-full text-center py-4">
                        No hay valores. Agrega al menos uno.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('options')}
                  className="btn-secondary"
                >
                  ← Opciones
                </button>
                <button
                  onClick={() => setCurrentStep('variants')}
                  className="btn-primary"
                >
                  Siguiente: Generar Inventario →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PASO 3: VARIANTES (INVENTARIO) */}
      {currentStep === 'variants' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📦 Inventario de Variantes
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Aquí defines el precio y stock de cada combinación. Por ejemplo: "Talla M + Color Rojo" tiene su propio precio y stock.
            </p>
          </div>

          {/* Botón generar variantes */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">🔄 Generar Variantes Automáticamente</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Se crearán todas las combinaciones posibles con precio base de S/ {basePrice.toFixed(2)}
                </p>
              </div>
              <button
                onClick={generateAllVariants}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Generar</span>
              </button>
            </div>
          </div>

          {/* Tabla de variantes */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Variante
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Precio (S/)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {variants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No hay variantes generadas. Haz clic en "Generar" para crearlas.
                      </td>
                    </tr>
                  ) : (
                    variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {variant.opciones_detalle?.map((opt: any, idx: number) => (
                              <span key={idx} className="flex items-center gap-1">
                                {opt.metadata?.hex && (
                                  <span
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: opt.metadata.hex }}
                                  />
                                )}
                                <span className="text-sm">
                                  {opt.option_value}
                                </span>
                                {idx < (variant.opciones_detalle?.length || 0) - 1 && (
                                  <span className="text-gray-400">·</span>
                                )}
                              </span>
                            ))}
                          </div>
                          {variant.variante_nombre && (
                            <p className="text-xs text-gray-500 mt-1">
                              {variant.variante_nombre}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price || ''}
                            onChange={(e) => updateVariant(
                              variant.id,
                              'price',
                              e.target.value ? parseFloat(e.target.value) : null
                            )}
                            className="input-field w-24"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={variant.stock ?? ''}
                            onChange={(e) => updateVariant(
                              variant.id,
                              'stock',
                              e.target.value ? parseInt(e.target.value) : null
                            )}
                            className="input-field w-20"
                            placeholder="∞"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => updateVariant(variant.id, 'is_active', !variant.is_active)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                              variant.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {variant.is_active ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Activa</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                <span>Inactiva</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteVariant(variant.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {variants.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>{variants.length} variantes</strong> configuradas. Los cambios se guardan automáticamente.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-start">
            <button
              onClick={() => setCurrentStep('values')}
              className="btn-secondary"
            >
              ← Valores
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
