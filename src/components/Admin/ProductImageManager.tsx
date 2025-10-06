import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Star, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';
import { ProductoImagen } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadImage } from '@/lib/cloudinary';

interface ProductImageManagerProps {
  productoId: string;
  onImagesChange?: () => void;
}

export default function ProductImageManager({ productoId, onImagesChange }: ProductImageManagerProps) {
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchImagenes();
  }, [productoId]);

  const fetchImagenes = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('producto_imagenes')
        .select('*')
        .eq('producto_id', productoId)
        .order('orden', { ascending: true });

      if (error) {
        console.error('Error fetching images:', error);
        return;
      }

      setImagenes(data || []);
    } catch (error) {
      console.error('Error in fetchImagenes:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

        const { error } = await supabaseAdmin
          .from('producto_imagenes')
          .insert([{
            producto_id: productoId,
            url: imageUrl,
            orden: maxOrden + 1 + i,
            es_principal: imagenes.length === 0 && i === 0, // Primera imagen como principal si no hay otras
            alt_text: `Imagen ${imagenes.length + i + 1}`
          }]);

        if (error) {
          console.error('Error inserting image:', error);
          alert(`Error al guardar imagen: ${error.message}`);
        }
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
      await supabaseAdmin
        .from('producto_imagenes')
        .update({ es_principal: false })
        .eq('producto_id', productoId);

      // Luego marcar la seleccionada como principal
      const { error } = await supabaseAdmin
        .from('producto_imagenes')
        .update({ es_principal: true })
        .eq('id', imagenId);

      if (error) {
        console.error('Error setting principal:', error);
        alert(`Error: ${error.message}`);
        return;
      }

      await fetchImagenes();
      if (onImagesChange) onImagesChange();
    } catch (error) {
      console.error('Error in handleSetPrincipal:', error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newImagenes = [...imagenes];
    const temp = newImagenes[index - 1];
    newImagenes[index - 1] = newImagenes[index];
    newImagenes[index] = temp;

    await updateOrden(newImagenes);
  };

  const handleMoveDown = async (index: number) => {
    if (index === imagenes.length - 1) return;

    const newImagenes = [...imagenes];
    const temp = newImagenes[index + 1];
    newImagenes[index + 1] = newImagenes[index];
    newImagenes[index] = temp;

    await updateOrden(newImagenes);
  };

  const updateOrden = async (newImagenes: ProductoImagen[]) => {
    try {
      // Actualizar el orden de cada imagen
      for (let i = 0; i < newImagenes.length; i++) {
        await supabaseAdmin
          .from('producto_imagenes')
          .update({ orden: i })
          .eq('id', newImagenes[i].id);
      }

      setImagenes(newImagenes);
      if (onImagesChange) onImagesChange();
    } catch (error) {
      console.error('Error updating orden:', error);
    }
  };

  const handleDelete = async (imagenId: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    try {
      const { error } = await supabaseAdmin
        .from('producto_imagenes')
        .delete()
        .eq('id', imagenId);

      if (error) {
        console.error('Error deleting image:', error);
        alert(`Error: ${error.message}`);
        return;
      }

      await fetchImagenes();
      if (onImagesChange) onImagesChange();
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
              className={`relative group rounded-lg overflow-hidden border-2 ${
                imagen.es_principal
                  ? 'border-amarillo dark:border-yellow-400'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
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
                <div className="absolute top-2 left-2 px-2 py-1 bg-amarillo dark:bg-yellow-400 text-gray-900 text-xs font-semibold rounded-full flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Principal</span>
                </div>
              )}

              {/* Orden */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {index + 1}
              </div>

              {/* Controles (aparecen al hover) */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center space-y-2">
                {/* Botones de orden */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 bg-white/90 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover arriba"
                  >
                    <ArrowUp className="w-4 h-4 text-gray-900" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === imagenes.length - 1}
                    className="p-1.5 bg-white/90 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover abajo"
                  >
                    <ArrowDown className="w-4 h-4 text-gray-900" />
                  </button>
                </div>

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
          <li>La imagen principal se muestra en el catálogo</li>
          <li>Usa las flechas para cambiar el orden de visualización</li>
          <li>Formatos recomendados: JPG, PNG, WEBP</li>
        </ul>
      </div>
    </div>
  );
}
