import { useState } from 'react'
import { MapPin, ExternalLink, X } from 'lucide-react'

interface GoogleMapsLocationPickerProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  helpText?: string
}

/**
 * Componente para seleccionar y guardar una ubicación de Google Maps
 * Permite pegar un link de Google Maps o abrir Google Maps para seleccionar
 */
export default function GoogleMapsLocationPicker({
  value = '',
  onChange,
  label = 'Ubicación en Google Maps',
  placeholder = 'Pega aquí el enlace de Google Maps',
  helpText = 'Opcional: Para asegurar la ubicación exacta'
}: GoogleMapsLocationPickerProps) {
  const [tempUrl, setTempUrl] = useState(value)
  const [isValid, setIsValid] = useState(true)

  const validateGoogleMapsUrl = (url: string): boolean => {
    if (!url) return true // Vacío es válido (campo opcional)
    
    // Validar que sea una URL de Google Maps
    const googleMapsPatterns = [
      /https?:\/\/(www\.)?google\.[a-z]+\/maps/i,
      /https?:\/\/maps\.google\.[a-z]+/i,
      /https?:\/\/goo\.gl\/maps/i,
      /https?:\/\/maps\.app\.goo\.gl/i
    ]
    
    return googleMapsPatterns.some(pattern => pattern.test(url))
  }

  const handleChange = (url: string) => {
    setTempUrl(url)
    const valid = validateGoogleMapsUrl(url)
    setIsValid(valid)
    
    if (valid) {
      onChange(url)
    }
  }

  const handleClear = () => {
    setTempUrl('')
    setIsValid(true)
    onChange('')
  }

  const handleOpenGoogleMaps = () => {
    // Abrir Google Maps en una nueva pestaña para que el usuario seleccione su ubicación
    window.open('https://www.google.com/maps', '_blank')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
          ({helpText})
        </span>
      </label>
      
      <div className="space-y-2">
        {/* Input para pegar URL */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="url"
            value={tempUrl}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={`input-field pl-10 pr-10 ${
              !isValid ? 'border-red-500 dark:border-red-400' : ''
            }`}
          />
          
          {tempUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
            </button>
          )}
        </div>

        {/* Mensaje de error */}
        {!isValid && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Por favor ingresa una URL válida de Google Maps
          </p>
        )}

        {/* Botón para abrir Google Maps */}
        <button
          type="button"
          onClick={handleOpenGoogleMaps}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Abrir Google Maps para seleccionar ubicación</span>
        </button>

        {/* Instrucciones */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>💡 Cómo obtener el enlace:</strong>
          </p>
          <ol className="text-xs text-blue-700 dark:text-blue-400 mt-2 ml-4 list-decimal space-y-1">
            <li>Haz clic en "Abrir Google Maps"</li>
            <li>Busca tu dirección o ubica el pin en el mapa</li>
            <li>Haz clic en "Compartir" o clic derecho → "Compartir este lugar"</li>
            <li>Copia el enlace y pégalo arriba</li>
          </ol>
        </div>

        {/* Vista previa del enlace */}
        {tempUrl && isValid && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
            <a
              href={tempUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Ver ubicación en Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
