import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { ProductoImagen } from '../../lib/supabase';

interface ProductGalleryProps {
  images: ProductoImagen[];
  productName: string;
  fallbackImage?: string;
}

export default function ProductGallery({ images, productName, fallbackImage }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Ordenar imágenes: principal primero, luego por orden
  const sortedImages = [...images].sort((a, b) => {
    if (a.es_principal && !b.es_principal) return -1;
    if (!a.es_principal && b.es_principal) return 1;
    return a.orden - b.orden;
  });

  // Si no hay imágenes, usar fallback
  const displayImages = sortedImages.length > 0 
    ? sortedImages 
    : fallbackImage 
    ? [{ id: 'fallback', url: fallbackImage, orden: 0, es_principal: true, producto_id: '', created_at: '', updated_at: '' }] as ProductoImagen[]
    : [];

  const currentImage = displayImages[selectedIndex];

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'Escape') setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedIndex, displayImages.length]);

  // Prevenir scroll cuando está en fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  // Swipe gestures para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  // Zoom al hacer hover en desktop
  const handleMouseEnter = () => {
    if (window.innerWidth >= 768 && !isFullscreen) {
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Zoom con seguimiento del mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    imageRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  if (displayImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500">Sin imagen</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagen Principal */}
      <div className="relative group">
        <div
          className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsFullscreen(true)}
        >
          <img
            ref={imageRef}
            src={currentImage?.url}
            alt={currentImage?.alt_text || `${productName} - Imagen ${selectedIndex + 1}`}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
          />

          {/* Botón de fullscreen */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-700"
            aria-label="Ver en pantalla completa"
          >
            <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Indicador de zoom (desktop) */}
          {window.innerWidth >= 768 && !isFullscreen && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Hover para zoom
            </div>
          )}

          {/* Flechas de navegación (si hay más de una imagen) */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-700"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-700"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </>
          )}

          {/* Contador de imágenes */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 text-white text-sm rounded-full">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails (si hay más de una imagen) */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                index === selectedIndex
                  ? 'ring-2 ring-amarillo dark:ring-yellow-400 scale-105'
                  : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt_text || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {image.es_principal && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-amarillo dark:bg-yellow-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Modal Fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Botón cerrar */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 z-10"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Contador en fullscreen */}
          {displayImages.length > 1 && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-white/10 text-white rounded-full z-10">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}

          {/* Imagen en fullscreen */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={currentImage?.url}
              alt={currentImage?.alt_text || `${productName} - Imagen ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Flechas de navegación en fullscreen */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Thumbnails en fullscreen */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 pb-2">
              {displayImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === selectedIndex
                      ? 'ring-2 ring-white scale-110'
                      : 'ring-1 ring-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
