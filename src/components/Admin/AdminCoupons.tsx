import React, { useState, useEffect } from 'react'
import { Ticket, Plus, Edit2, Trash2, Check, X, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import { 
  obtenerCupones, 
  crearCupon, 
  actualizarCupon, 
  eliminarCupon,
  type Cupon 
} from '@/lib/cupones'
import { supabase } from '@/lib/supabase'

interface CouponStats {
  total_usos: number
  usuarios_unicos: number
  descuento_total: number
}

const AdminCoupons: React.FC = () => {
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Cupon | null>(null)
  const [stats, setStats] = useState<Map<string, CouponStats>>(new Map())
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'porcentaje' as 'porcentaje' | 'monto_fijo',
    valor: 0,
    descripcion: '',
    fecha_expiracion: '',
    usos_maximos: '',
    monto_minimo: 0,
    activo: true
  })

  useEffect(() => {
    cargarCupones()
  }, [])

  const cargarCupones = async () => {
    setLoading(true)
    const cupones = await obtenerCupones()
    setCupones(cupones)
    
    // Cargar estadísticas para cada cupón
    await cargarEstadisticas(cupones)
    
    setLoading(false)
  }

  const cargarEstadisticas = async (cupones: Cupon[]) => {
    const newStats = new Map<string, CouponStats>()
    
    for (const cupon of cupones) {
      const { data } = await supabase
        .from('cupones_usados')
        .select('usuario_id, descuento_aplicado')
        .eq('cupon_id', cupon.id)

      if (data) {
        const total_usos = data.length
        const usuarios_unicos = new Set(data.map(u => u.usuario_id)).size
        const descuento_total = data.reduce((sum, u) => sum + Number(u.descuento_aplicado), 0)
        
        newStats.set(cupon.id, { total_usos, usuarios_unicos, descuento_total })
      }
    }
    
    setStats(newStats)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
        ? Number(value) 
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cuponData = {
      codigo: formData.codigo.toUpperCase().trim(),
      tipo: formData.tipo,
      valor: formData.valor,
      descripcion: formData.descripcion,
      fecha_inicio: new Date().toISOString(),
      fecha_expiracion: formData.fecha_expiracion || null,
      usos_maximos: formData.usos_maximos ? Number(formData.usos_maximos) : null,
      monto_minimo: formData.monto_minimo,
      activo: formData.activo
    }

    if (editingCoupon) {
      await actualizarCupon(editingCoupon.id, cuponData)
    } else {
      await crearCupon(cuponData)
    }

    setShowModal(false)
    resetForm()
    cargarCupones()
  }

  const handleEdit = (cupon: Cupon) => {
    setEditingCoupon(cupon)
    setFormData({
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      valor: cupon.valor,
      descripcion: cupon.descripcion || '',
      fecha_expiracion: cupon.fecha_expiracion ? cupon.fecha_expiracion.split('T')[0] : '',
      usos_maximos: cupon.usos_maximos?.toString() || '',
      monto_minimo: cupon.monto_minimo || 0,
      activo: cupon.activo
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cupón?')) {
      await eliminarCupon(id)
      cargarCupones()
    }
  }

  const toggleActivo = async (cupon: Cupon) => {
    await actualizarCupon(cupon.id, { activo: !cupon.activo })
    cargarCupones()
  }

  const resetForm = () => {
    setFormData({
      codigo: '',
      tipo: 'porcentaje',
      valor: 0,
      descripcion: '',
      fecha_expiracion: '',
      usos_maximos: '',
      monto_minimo: 0,
      activo: true
    })
    setEditingCoupon(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo dark:border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100 flex items-center">
            <Ticket className="w-7 h-7 mr-2 text-amarillo dark:text-yellow-400" />
            Gestión de Cupones
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los cupones de descuento de la tienda
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Cupón
        </button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cupones Activos</p>
              <p className="text-3xl font-bold text-gris-oscuro dark:text-gray-100 mt-1">
                {cupones.filter(c => c.activo).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Ticket className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cupones</p>
              <p className="text-3xl font-bold text-gris-oscuro dark:text-gray-100 mt-1">
                {cupones.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Descuento Total</p>
              <p className="text-3xl font-bold text-gris-oscuro dark:text-gray-100 mt-1">
                S/ {Array.from(stats.values()).reduce((sum, s) => sum + s.descuento_total, 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Cupones */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mínimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expira
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {cupones.map((cupon) => {
                const cuponStats = stats.get(cupon.id)
                return (
                  <tr key={cupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Ticket className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gris-oscuro dark:text-gray-100">
                            {cupon.codigo}
                          </div>
                          {cupon.descripcion && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {cupon.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cupon.tipo === 'porcentaje'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {cupon.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gris-oscuro dark:text-gray-100">
                      {cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `S/ ${cupon.valor.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gris-oscuro dark:text-gray-100">
                        {cupon.usos_actuales || 0} / {cupon.usos_maximos || '∞'}
                      </div>
                      {cuponStats && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Users className="w-3 h-3 mr-1" />
                          {cuponStats.usuarios_unicos} usuarios
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gris-oscuro dark:text-gray-100">
                      S/ {cupon.monto_minimo?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cupon.fecha_expiracion ? (
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(cupon.fecha_expiracion).toLocaleDateString('es-PE')}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">Sin expiración</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActivo(cupon)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          cupon.activo
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                        }`}
                      >
                        {cupon.activo ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(cupon)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cupon.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gris-oscuro dark:text-gray-100">
                {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Código del Cupón *
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    required
                    maxLength={50}
                    className="input-field uppercase"
                    placeholder="VERANO30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Tipo de Descuento *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto Fijo (S/)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Valor del Descuento *
                  </label>
                  <input
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="input-field"
                    placeholder={formData.tipo === 'porcentaje' ? '10' : '50.00'}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.tipo === 'porcentaje' ? 'Porcentaje de descuento (0-100)' : 'Monto en soles'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Compra Mínima (S/)
                  </label>
                  <input
                    type="number"
                    name="monto_minimo"
                    value={formData.monto_minimo}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Usos Máximos
                  </label>
                  <input
                    type="number"
                    name="usos_maximos"
                    value={formData.usos_maximos}
                    onChange={handleInputChange}
                    min="1"
                    className="input-field"
                    placeholder="Ilimitado"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Dejar vacío para usos ilimitados
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Fecha de Expiración
                  </label>
                  <input
                    type="date"
                    name="fecha_expiracion"
                    value={formData.fecha_expiracion}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={200}
                  className="input-field"
                  placeholder="Descripción del cupón..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                  className="mr-2 text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                />
                <label htmlFor="activo" className="text-sm text-gray-700 dark:text-gray-300">
                  Cupón activo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingCoupon ? 'Actualizar Cupón' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCoupons
