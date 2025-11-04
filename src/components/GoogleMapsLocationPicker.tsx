import { useState, useEffect, useRef } from 'react'
import { MapPin, ExternalLink, X, Loader2, Navigation } from 'lucide-react'

/// <reference types="@types/google.maps" />

interface GoogleMapsLocationPickerProps {
  value?: string
  onChange: (url: string, lat?: number, lng?: number) => void
  label?: string
  helpText?: string
}

/**
 * Componente para seleccionar y guardar una ubicación de Google Maps
 * Muestra un mapa interactivo donde el usuario puede colocar un pin
 */
export default function GoogleMapsLocationPicker({
  value = '',
  onChange,
  label = 'Ubicación en Google Maps',
  helpText = 'para asegurar la ubicación exacta'
}: GoogleMapsLocationPickerProps) {
  const [showMap, setShowMap] = useState(false)
  const [isLoadingMap, setIsLoadingMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState('')
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // Cargar Google Maps Script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      console.error('❌ Google Maps API Key no configurada en .env.local')
      return
    }

    // Verificar si ya está cargado
    if ((window as any).google?.maps) {
      console.log('✅ Google Maps ya está cargado')
      return
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log('✅ Script de Google Maps ya existe')
      return
    }

    console.log('🔄 Cargando Google Maps API...')
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('✅ Google Maps API cargada correctamente')
    }
    script.onerror = (error) => {
      console.error('❌ Error cargando Google Maps:', error)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup si es necesario
    }
  }, [])

  // Inicializar el mapa cuando se abre el modal
  useEffect(() => {
    if (!showMap || !mapRef.current || googleMapRef.current) return

    setIsLoadingMap(true)

    const initMap = () => {
      if (!(window as any).google?.maps) {
        console.error('❌ Google Maps no está disponible')
        setIsLoadingMap(false)
        return
      }

      console.log('🗺️ Inicializando mapa...')

      // Ubicación por defecto (Lima, Perú)
      const defaultLocation = { lat: -12.0464, lng: -77.0428 }

      try {
        // Crear el mapa
        const map = new (window as any).google.maps.Map(mapRef.current!, {
          center: defaultLocation,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        googleMapRef.current = map
        console.log('✅ Mapa creado')

        // Crear marcador
        const marker = new (window as any).google.maps.Marker({
          map: map,
          position: defaultLocation,
          draggable: true,
          animation: (window as any).google.maps.Animation.DROP,
          title: 'Arrastra este pin para ajustar la ubicación'
        })

        markerRef.current = marker
        console.log('✅ Marcador creado')

        // Evento cuando se arrastra el marcador
        marker.addListener('dragend', () => {
          const position = marker.getPosition()
          if (position) {
            const lat = position.lat()
            const lng = position.lng()
            console.log('📍 Nueva posición:', lat, lng)
            setSelectedLocation({ lat, lng })
            reverseGeocode(lat, lng)
          }
        })

        // Evento cuando se hace clic en el mapa
        map.addListener('click', (e: any) => {
          if (e.latLng) {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            console.log('🖱️ Clic en mapa:', lat, lng)
            marker.setPosition(e.latLng)
            setSelectedLocation({ lat, lng })
            reverseGeocode(lat, lng)
          }
        })

        // Establecer ubicación inicial
        setSelectedLocation(defaultLocation)
        reverseGeocode(defaultLocation.lat, defaultLocation.lng)

        setIsLoadingMap(false)
        console.log('✅ Mapa inicializado correctamente')

      } catch (error) {
        console.error('❌ Error inicializando mapa:', error)
        setIsLoadingMap(false)
      }
    }

    // Esperar a que Google Maps esté cargado
    if ((window as any).google?.maps) {
      console.log('✅ Google Maps disponible, inicializando...')
      initMap()
    } else {
      console.log('⏳ Esperando a que Google Maps se cargue...')
      const checkGoogleMaps = setInterval(() => {
        if ((window as any).google?.maps) {
          console.log('✅ Google Maps detectado, inicializando...')
          clearInterval(checkGoogleMaps)
          initMap()
        }
      }, 100)

      // Timeout de 10 segundos
      setTimeout(() => {
        clearInterval(checkGoogleMaps)
        if (!(window as any).google?.maps) {
          console.error('❌ Timeout esperando Google Maps')
          setIsLoadingMap(false)
        }
      }, 10000)
    }
  }, [showMap])

  // Reverse Geocoding para obtener dirección de coordenadas
  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new (window as any).google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        setAddress(results[0].formatted_address)
      }
    })
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      // Generar enlace de Google Maps
      const googleMapsUrl = `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`
      onChange(googleMapsUrl, selectedLocation.lat, selectedLocation.lng)
      setShowMap(false)
    }
  }

  const handleClear = () => {
    setSelectedLocation(null)
    setAddress('')
    onChange('')
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    console.log('📍 Solicitando ubicación actual...')

    // Opciones para mejor precisión
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Ubicación obtenida:', position.coords.latitude, position.coords.longitude)
        
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        
        if (googleMapRef.current && markerRef.current) {
          googleMapRef.current.setCenter(userLocation)
          googleMapRef.current.setZoom(16)
          markerRef.current.setPosition(userLocation)
          setSelectedLocation(userLocation)
          reverseGeocode(userLocation.lat, userLocation.lng)
        }
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación:', error)
        
        let errorMessage = 'No se pudo obtener tu ubicación. '
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Por favor, permite el acceso a tu ubicación en el navegador.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'La información de ubicación no está disponible.'
            break
          case error.TIMEOUT:
            errorMessage += 'La solicitud de ubicación ha expirado.'
            break
          default:
            errorMessage += 'Error desconocido.'
        }
        
        alert(errorMessage)
      },
      options
    )
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
        {/* Vista previa de la ubicación seleccionada */}
        {value && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-start justify-between space-x-2">
              <div className="flex items-start space-x-2 flex-1">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Ubicación guardada
                  </p>
                  {address && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {address}
                    </p>
                  )}
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center space-x-1 mt-1"
                  >
                    <span>Ver en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
                title="Eliminar ubicación"
              >
                <X className="w-4 h-4 text-green-600 dark:text-green-400" />
              </button>
            </div>
          </div>
        )}

        {/* Botón para abrir el mapa */}
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-amarillo dark:hover:border-yellow-400 transition-colors"
        >
          <MapPin className="w-5 h-5" />
          <span>{value ? 'Cambiar ubicación en el mapa' : 'Seleccionar ubicación en el mapa'}</span>
        </button>

        {/* Instrucciones */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>💡 Cómo funciona:</strong>
          </p>
          <ol className="text-xs text-blue-700 dark:text-blue-400 mt-2 ml-4 list-decimal space-y-1">
            <li>Haz clic en "Seleccionar ubicación en el mapa"</li>
            <li>Arrastra el pin rojo o haz clic en el mapa</li>
            <li>Confirma tu ubicación exacta</li>
          </ol>
        </div>
      </div>

      {/* Modal del mapa */}
      {showMap && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={() => setShowMap(false)}
            />

            {/* Modal */}
            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Selecciona tu ubicación exacta
                  </h3>
                  <button
                    onClick={() => setShowMap(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    📍 {address}
                  </p>
                )}
              </div>

              {/* Mapa */}
              <div className="relative">
                {isLoadingMap && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-amarillo dark:text-yellow-400 mx-auto" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Cargando mapa...
                      </p>
                    </div>
                  </div>
                )}
                
                <div 
                  ref={mapRef} 
                  className="w-full h-96 bg-gray-200 dark:bg-gray-700"
                />

                {/* Botón de ubicación actual */}
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="absolute top-4 right-4 p-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                  title="Usar mi ubicación actual"
                >
                  <Navigation className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Arrastra el pin rojo o haz clic en el mapa para ajustar la ubicación
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowMap(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmLocation}
                      disabled={!selectedLocation}
                      className="px-4 py-2 text-sm font-medium text-white bg-amarillo dark:bg-yellow-500 rounded-lg hover:bg-yellow-500 dark:hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Confirmar ubicación
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
