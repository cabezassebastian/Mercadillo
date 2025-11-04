import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Star, GripVertical, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { ProductoImagen } from '@/lib/supabase';
import { uploadImage } from '@/lib/cloudinary';
import { fetchAdmin } from '../../lib/adminApi';

interface ProductImageManagerProps {
  productoId: string;
  onImagesChange?: () => void;
}

export default function ProductImageManager({ productoId, onImagesChange }: ProductImageManagerProps) {
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchImagenes();
  }, [productoId]);

  const fetchImagenes = async () => {
    try {
      const json = await fetchAdmin(`product-images&productId=${encodeURIComponent(productoId)}`)
      const imagenesData = json.data || []
      
      // Si no hay imágenes en la galería pero el producto tiene imagen principal,
      // sincronizarla automáticamente
      if (imagenesData.length === 0) {
        await sincronizarImagenPrincipal()
        return // fetchImagenes se llamará de nuevo después de sincronizar
      }
      
      // Ordenar: imagen principal primero, luego por orden
      const sorted = imagenesData.sort((a: ProductoImagen, b: ProductoImagen) => {
        if (a.es_principal) return -1
        if (b.es_principal) return 1
        return a.orden - b.orden
      })
      
      setImagenes(sorted)
    } catch (error) {
      console.error('Error in fetchImagenes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sincronizarImagenPrincipal = async () => {
    try {
      // Obtener el producto para verificar si tiene imagen principal
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/productos?id=eq.${productoId}&select=imagen`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      })
      
      const productos = await response.json()
      const producto = productos[0]
      
      if (producto?.imagen) {
        // Crear registro en producto_imagenes
        const body = {
          producto_id: productoId,
          url: producto.imagen,
          orden: 0,
          es_principal: true,
          alt_text: 'Imagen principal'
        }
        await fetchAdmin('product-images', { method: 'POST', body: JSON.stringify(body) })
        
        // Re-fetch las imágenes
        await fetchImagenes()
      }
    } catch (error) {
      console.error('Error sincronizando imagen principal:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadImage(file);
        
        // Obtener el siguiente orden
        const maxOrden = imagenes.length > 0 
          ? Math.max(...imagenes.map(img => img.orden)) 
          : -1;

        const body = {
          producto_id: productoId,
          url: imageUrl,
          orden: maxOrden + 1 + i,
          es_principal: imagenes.length === 0 && i === 0,
          alt_text: `Imagen ${imagenes.length + i + 1}`
        }
        await fetchAdmin('product-images', { method: 'POST', body: JSON.stringify(body) })
      }

      await fetchImagenes();
      if (onImagesChange) onImagesChange();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error al subir las imágenes');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrincipal = async (imagenId: string) => {
    try {
      // Primero desmarcar todas las imágenes principales
      await fetchAdmin('product-images', { method: 'PUT', body: JSON.stringify({ id: null, updates: { es_principal: false, producto_id: productoId } }) })
      await fetchAdmin('product-images', { method: 'PUT', body: JSON.stringify({ id: imagenId, updates: { es_principal: true } }) })

      await fetchImagenes()
      if (onImagesChange) onImagesChange()
    } catch (error) {
      console.error('Error in handleSetPrincipal:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
    // Añadir clase visual al elemento arrastrado
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '1'
    setDraggedIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedIndex === null || draggedIndex === dropIndex) return
    
    // No permitir soltar antes de la imagen principal
    if (dropIndex === 0 && imagenes[0].es_principal) return

    const newImagenes = [...imagenes]
    const [draggedItem] = newImagenes.splice(draggedIndex, 1)
    newImagenes.splice(dropIndex, 0, draggedItem)

    // Actualizar orden en la base de datos
    await updateOrden(newImagenes)
  }

  const updateOrden = async (newImagenes: ProductoImagen[]) => {
    try {
        // Actualizar localmente primero para feedback instantáneo
        setImagenes(newImagenes)
        
        // Update order individually for each image
        for (let i = 0; i < newImagenes.length; i++) {
          await fetchAdmin('product-images', { 
            method: 'PUT', 
            body: JSON.stringify({ 
              id: newImagenes[i].id, 
              updates: { orden: i } 
            }) 
          })
        }
        
        if (onImagesChange) onImagesChange()
    } catch (error) {
      console.error('Error updating orden:', error);
      alert('Error al actualizar el orden de las imágenes')
      // Revertir en caso de error
      await fetchImagenes()
    }
  };

  const moveImage = async (fromIndex: number, direction: 'up' | 'down') => {
    // No permitir mover la imagen principal
    if (imagenes[fromIndex].es_principal) return
    
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    
    // Verificar límites
    if (toIndex < 0 || toIndex >= imagenes.length) return
    
    // No permitir mover una imagen antes de la principal
    if (toIndex === 0 && imagenes[0].es_principal) return
    
    const newImagenes = [...imagenes]
    const [movedItem] = newImagenes.splice(fromIndex, 1)
    newImagenes.splice(toIndex, 0, movedItem)
    
    await updateOrden(newImagenes)
  }

  const handleDelete = async (imagenId: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    try {
      await fetchAdmin(`product-images&id=${encodeURIComponent(imagenId)}`, { method: 'DELETE' })

      await fetchImagenes()
      if (onImagesChange) onImagesChange()
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amarillo dark:border-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <ImageIcon className="w-5 h-5" />
          <span>Galería de Imágenes ({imagenes.length})</span>
        </h3>
        <label className="btn-primary cursor-pointer flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Subiendo...' : 'Subir Imágenes'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {imagenes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No hay imágenes en la galería
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Sube una o más imágenes para comenzar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {imagenes.map((imagen, index) => (
            <div
              key={imagen.id}
              draggable={!imagen.es_principal}
              onDragStart={(e) => !imagen.es_principal && handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnter={(e) => e.preventDefault()}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                imagen.es_principal
                  ? 'border-amarillo dark:border-yellow-400 cursor-default'
                  : 'border-gray-200 dark:border-gray-700 cursor-move hover:border-amarillo dark:hover:border-yellow-400'
              } ${draggedIndex === index ? 'scale-105 shadow-lg opacity-50' : ''} ${draggedIndex !== null && draggedIndex !== index ? 'border-dashed border-amarillo/50' : ''}`}
            >
              {/* Icono de arrastre - solo para imágenes no principales */}
              {!imagen.es_principal && (
                <div className="absolute top-2 left-2 z-10 p-1 bg-black/60 rounded cursor-move">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Botones de ordenamiento con flechas - solo para imágenes no principales */}
              {!imagen.es_principal && (
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                  {/* Flecha arriba - solo si no es la primera imagen después de la principal */}
                  {index > (imagenes[0].es_principal ? 1 : 0) && (
                    <button
                      onClick={() => moveImage(index, 'up')}
                      className="p-1 bg-black/60 hover:bg-black/80 rounded transition-colors"
                      title="Mover arriba"
                    >
                      <ChevronUp className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {/* Flecha abajo - solo si no es la última */}
                  {index < imagenes.length - 1 && (
                    <button
                      onClick={() => moveImage(index, 'down')}
                      className="p-1 bg-black/60 hover:bg-black/80 rounded transition-colors"
                      title="Mover abajo"
                    >
                      <ChevronDown className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              )}

              {/* Imagen */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                <img
                  src={imagen.url}
                  alt={imagen.alt_text || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Badge de principal */}
              {imagen.es_principal && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-amarillo dark:bg-yellow-400 text-gray-900 text-xs font-semibold rounded-full flex items-center space-x-1 z-10">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Principal</span>
                </div>
              )}

              {/* Número de orden */}
              {!imagen.es_principal && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/60 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {index}
                </div>
              )}

              {/* Controles (aparecen al hover) */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center space-y-2">
                {/* Marcar como principal */}
                {!imagen.es_principal && (
                  <button
                    onClick={() => handleSetPrincipal(imagen.id)}
                    className="px-3 py-1.5 bg-amarillo hover:bg-yellow-500 text-gray-900 text-xs font-semibold rounded flex items-center space-x-1"
                    title="Marcar como principal"
                  >
                    <Star className="w-3 h-3" />
                    <span>Principal</span>
                  </button>
                )}

                {/* Eliminar */}
                <button
                  onClick={() => handleDelete(imagen.id)}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded flex items-center space-x-1"
                  title="Eliminar imagen"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <p className="font-semibold mb-1">💡 Consejos:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Puedes subir múltiples imágenes a la vez</li>
          <li>La imagen principal siempre aparece primero en la galería</li>
          <li><strong>Arrastra y suelta</strong> las imágenes o usa las <strong>flechitas ↑↓</strong> para cambiar su orden</li>
          <li>La imagen principal se muestra en el catálogo y como primera en la galería del producto</li>
          <li>Formatos recomendados: JPG, PNG, WEBP</li>
        </ul>
      </div>
    </div>
  );
}
