import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Upload, Search } from 'lucide-react'
import { Producto } from '@/lib/supabase'
import { uploadImage } from '@/lib/cloudinary'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import ProductImageManager from './ProductImageManager'
import VariantsEditorNew from './VariantsEditorNew'

const AdminProducts: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [isVariantsOpen, setIsVariantsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagen: ''
  })

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      // Obtener imágenes principales para cada producto
      if (data && data.length > 0) {
        const productosConImagenes = await Promise.all(
          data.map(async (producto) => {
            const { data: imagenes } = await supabaseAdmin
              .from('producto_imagenes')
              .select('url')
              .eq('producto_id', producto.id)
              .eq('es_principal', true)
              .single()
            
            // Si hay imagen principal en la galería, usarla; si no, usar la imagen original
            return {
              ...producto,
              imagen: imagenes?.url || producto.imagen
            }
          })
        )
        setProductos(productosConImagenes)
      } else {
        setProductos(data || [])
      }
    } catch (error) {
      console.error('Error in fetchProductos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imageUrl = await uploadImage(file)
      setFormData(prev => ({ ...prev, imagen: imageUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Prepare base product data
      const productData: any = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        imagen: formData.imagen,
        activo: true
      }

      // If editing existing product and admin left stock empty, try to compute
      // total stock from variants so the product-level stock reflects sum of variants
      if (editingProduct) {
        if (formData.stock === '') {
          // sum variant stock for this product
          try {
            const { data: vars } = await supabaseAdmin
              .from('product_variants')
              .select('stock')
              .eq('product_id', editingProduct.id)

            const total = (vars || []).reduce((s: number, v: any) => s + (v.stock == null ? 0 : Number(v.stock)), 0)
            productData.stock = total > 0 ? total : null
          } catch (err) {
            console.warn('No se pudo calcular stock desde variantes, dejando stock nulo', err)
            productData.stock = null
          }
        } else {
          productData.stock = parseInt(formData.stock)
        }
      } else {
        // creating new product
        productData.stock = formData.stock === '' ? null : parseInt(formData.stock)
      }

      if (editingProduct) {
        // Actualizar producto existente
        const { error } = await supabaseAdmin
          .from('productos')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) {
          console.error('Error updating product:', error)
          alert(`Error al actualizar: ${error.message}`)
          return
        }
      } else {
        // Crear nuevo producto
        const { error } = await supabaseAdmin
          .from('productos')
          .insert([productData])

        if (error) {
          console.error('Error creating product:', error)
          alert(`Error al crear: ${error.message}`)
          return
        }
      }

      // Limpiar formulario y cerrar modal
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        imagen: ''
      })
      setEditingProduct(null)
      setIsModalOpen(false)
      fetchProductos()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    }
  }

  const handleEdit = (producto: Producto) => {
    setEditingProduct(producto)
    // If producto.stock is null, try to fetch sum of variant stock and display that
    const initialStock = producto.stock != null ? producto.stock.toString() : ''
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      stock: initialStock,
      categoria: producto.categoria,
      imagen: producto.imagen
    })
    setIsModalOpen(true)

    // If stock was null, populate with variant sum asynchronously
    if (producto.stock == null) {
      ;(async () => {
        try {
          const { data: vars } = await supabaseAdmin
            .from('product_variants')
            .select('stock')
            .eq('product_id', producto.id)

          const total = (vars || []).reduce((s: number, v: any) => s + (v.stock == null ? 0 : Number(v.stock)), 0)
          if (total > 0) {
            setFormData(prev => ({ ...prev, stock: String(total) }))
          }
        } catch (err) {
          console.warn('No se pudo obtener stock combinado de variantes', err)
        }
      })()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    try {
      const { error } = await supabaseAdmin
        .from('productos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
        alert(`Error al eliminar: ${error.message}`)
        return
      }

      fetchProductos()
    } catch (error) {
      console.error('Error in handleDelete:', error)
      alert('Error inesperado al eliminar producto')
    }
  }

  const openModal = () => {
    setEditingProduct(null)
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagen: ''
    })
    setIsModalOpen(true)
  }

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gris-oscuro">Gestión de Productos</h2>
          <p className="text-gray-600">Administra tu catálogo de productos</p>
        </div>
        <button
          onClick={openModal}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gris-oscuro">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {producto.descripcion.length > 15 
                            ? `${producto.descripcion.substring(0, 15)}...` 
                            : producto.descripcion}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {producto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dorado">
                    {formatPrice(producto.precio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {producto.stock == null ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">—</span>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        producto.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : producto.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {producto.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="text-amarillo hover:text-dorado transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gris-oscuro dark:text-white mb-6">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro mb-2">
                    Categoría
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Electrónicos">Electrónicos</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Libros">Libros</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gris-oscuro mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro mb-2">
                    Precio (S/)
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="input-field"
                    placeholder="Dejar vacío para gestionar stock por variante"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gris-oscuro mb-2">
                  Imagen Principal
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="btn-secondary flex items-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir Imagen</span>
                  </label>
                  {formData.imagen && (
                    <div className="w-16 h-16 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={formData.imagen}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Galería de imágenes adicionales */}
              {editingProduct ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <ProductImageManager 
                    productoId={editingProduct.id}
                    onImagesChange={() => {
                      // Refrescar la lista de productos para actualizar el thumbnail
                      fetchProductos();
                    }}
                  />
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setIsVariantsOpen(true)}
                      className="btn-secondary"
                    >
                      Administrar Variantes (Tallas/Colores)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 text-center">
                    <div className="text-blue-600 dark:text-blue-400 mb-2">
                      <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Galería de Imágenes
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                      Para agregar múltiples imágenes y gestionar la galería:
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      1. Primero crea el producto con la imagen principal<br />
                      2. Luego edítalo para agregar más imágenes a la galería
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isVariantsOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gris-oscuro dark:text-white mb-6">
              📦 Administrar Variantes — {editingProduct.nombre}
            </h3>
            <VariantsEditorNew productoId={editingProduct.id} />
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button 
                onClick={() => { setIsVariantsOpen(false); fetchProductos(); }} 
                className="btn-primary"
              >
                Cerrar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts


