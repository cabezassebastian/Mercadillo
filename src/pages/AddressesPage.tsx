import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { MapPin, Plus, Edit, Trash2, Star, Check, X } from 'lucide-react'
import { 
  getUserAddresses, 
  createUserAddress, 
  updateUserAddress, 
  deleteUserAddress,
  type UserAddress 
} from '@/lib/userProfile'
import { useNotificationHelpers } from '@/contexts/NotificationContext'

const AddressesPage: React.FC = () => {
  const { user } = useUser()
  const { showAddressAdded, showAddressUpdated, showAddressDeleted, showError } = useNotificationHelpers()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [saving, setSaving] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion_completa: '',
    distrito: '',
    provincia: '',
    departamento: '',
    codigo_postal: '',
    referencia: '',
    telefono_contacto: '',
    es_predeterminada: false
  })

  useEffect(() => {
    if (user?.id) {
      loadAddresses()
    }
  }, [user?.id])

  const loadAddresses = async () => {
    if (!user?.id) return

    setLoading(true)
    const result = await getUserAddresses(user.id)
    
    if (result.error) {
      setError(result.error)
    } else {
      setAddresses(result.data || [])
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion_completa: '',
      distrito: '',
      provincia: '',
      departamento: '',
      codigo_postal: '',
      referencia: '',
      telefono_contacto: '',
      es_predeterminada: false
    })
    setEditingAddress(null)
    setShowForm(false)
  }

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address)
    setFormData({
      nombre: address.nombre,
      direccion_completa: address.direccion_completa,
      distrito: address.distrito || '',
      provincia: address.provincia,
      departamento: address.departamento,
      codigo_postal: address.codigo_postal || '',
      referencia: address.referencia || '',
      telefono_contacto: address.telefono_contacto || '',
      es_predeterminada: address.es_predeterminada || false
    })
    setShowForm(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) return

    const result = await deleteUserAddress(addressId)
    
    if (result.error) {
      showError('Error al eliminar', result.error)
    } else {
      showAddressDeleted()
      await loadAddresses()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    setError(null)

    try {
      let result

      if (editingAddress) {
        // Actualizar dirección existente
        result = await updateUserAddress(editingAddress.id, formData)
      } else {
        // Crear nueva dirección
        result = await createUserAddress(user.id, formData)
      }

      if (result.error) {
        showError('Error al guardar', result.error)
      } else {
        if (editingAddress) {
          showAddressUpdated()
        } else {
          showAddressAdded()
        }
        await loadAddresses()
        resetForm()
      }
    } catch (err) {
      setError('Error al guardar la dirección')
    } finally {
      setSaving(false)
    }
  }

  const handleSetAsDefault = async (addressId: string) => {
    const addressToUpdate = addresses.find(addr => addr.id === addressId)
    if (!addressToUpdate) return

    const result = await updateUserAddress(addressId, {
      ...addressToUpdate,
      es_predeterminada: true
    })

    if (result.error) {
      showError('Error al actualizar', result.error)
    } else {
      showAddressUpdated()
      await loadAddresses()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Mis Direcciones
              </h1>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Dirección</span>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus direcciones de envío
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Casa, Oficina, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono_contacto}
                    onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                    placeholder="Ej: 987654321"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dirección Completa
                </label>
                <textarea
                  value={formData.direccion_completa}
                  onChange={(e) => setFormData({ ...formData, direccion_completa: e.target.value })}
                  placeholder="Ej: Av. Lima 123, San Isidro"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Distrito
                  </label>
                  <input
                    type="text"
                    value={formData.distrito}
                    onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                    placeholder="Ej: San Isidro"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    placeholder="Ej: Lima"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    placeholder="Ej: Lima"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                    placeholder="Ej: 15001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Referencia
                  </label>
                  <input
                    type="text"
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    placeholder="Ej: Cerca al parque principal"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="es_predeterminada"
                  checked={formData.es_predeterminada}
                  onChange={(e) => setFormData({ ...formData, es_predeterminada: e.target.checked })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="es_predeterminada" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Establecer como dirección predeterminada
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200"
                >
                  {saving ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {editingAddress ? 'Actualizar' : 'Guardar'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de direcciones */}
        {addresses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No tienes direcciones guardadas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Agrega tu primera dirección para facilitar tus compras
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Dirección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 ${
                  address.es_predeterminada 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-transparent'
                }`}
              >
                {/* Header con nombre y botón predeterminado */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {address.nombre}
                    </h3>
                    {address.es_predeterminada && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        <Star className="w-3 h-3 mr-1" />
                        Predeterminada
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Información de la dirección */}
                <div className="space-y-2 mb-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {address.direccion_completa}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {address.distrito && `${address.distrito}, `}{address.provincia}, {address.departamento}
                    {address.codigo_postal && ` - ${address.codigo_postal}`}
                  </p>
                  {address.referencia && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Ref: {address.referencia}
                    </p>
                  )}
                  {address.telefono_contacto && (
                    <p className="text-gray-600 dark:text-gray-400">
                      Tel: {address.telefono_contacto}
                    </p>
                  )}
                </div>

                {/* Botón para establecer como predeterminada */}
                {!address.es_predeterminada && (
                  <button
                    onClick={() => handleSetAsDefault(address.id)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Establecer como Predeterminada
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddressesPage