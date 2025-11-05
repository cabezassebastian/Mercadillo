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
    activo: true,
    categoria: '',
    only_first_purchase: false,
    tipo_cupon: 'general' as 'general' | 'primera_compra' | 'cumpleanos' | 'carrito_abandonado' | 'referido',
    es_cumpleanos: false,
    es_carrito_abandonado: false
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
      activo: cupon.activo,
      categoria: cupon.categoria || '',
      only_first_purchase: cupon.only_first_purchase || false,
      tipo_cupon: (cupon.tipo_cupon || 'general') as 'general' | 'primera_compra' | 'cumpleanos' | 'carrito_abandonado' | 'referido',
      es_cumpleanos: cupon.es_cumpleanos || false,
      es_carrito_abandonado: cupon.es_carrito_abandonado || false
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
      activo: true,
      categoria: '',
      only_first_purchase: false,
      tipo_cupon: 'general',
      es_cumpleanos: false,
      es_carrito_abandonado: false
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

      {/* Panel de Estadísticas Globales Mejorado */}
      <div className="card p-6 bg-gradient-to-br from-amarillo/10 to-orange-100/20 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-amarillo/30 dark:border-yellow-600/30">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-amarillo dark:bg-yellow-600 rounded-lg mr-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gris-oscuro dark:text-gray-100">
              📊 Estadísticas Globales de Cupones
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Métricas en tiempo real del sistema de cupones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
          {/* Total Cupones */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                TOTAL
              </span>
            </div>
            <p className="text-2xl font-bold text-gris-oscuro dark:text-gray-100">
              {cupones.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Cupones creados
            </p>
          </div>

          {/* Cupones Activos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                ACTIVOS
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {cupones.filter(c => c.activo).length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Disponibles ahora
            </p>
          </div>

          {/* Cupones Expirados */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">
                EXPIRADOS
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {cupones.filter(c => c.fecha_expiracion && new Date(c.fecha_expiracion) < new Date()).length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Vencidos
            </p>
          </div>

          {/* Usos Totales */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                USOS
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {cupones.reduce((sum, c) => sum + (c.veces_usado || 0), 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Veces aplicado
            </p>
          </div>

          {/* Descuento Total Aplicado */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
                💰 TOTAL
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              S/ {cupones.reduce((sum, c) => sum + (c.total_descuento_aplicado || 0), 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              En descuentos
            </p>
          </div>

          {/* Usuarios Únicos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                USUARIOS
              </span>
            </div>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {Array.from(stats.values()).reduce((sum, s) => sum + s.usuarios_unicos, 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Clientes únicos
            </p>
          </div>
        </div>

        {/* Desglose por Tipo de Cupón */}
        <div className="mt-6 pt-6 border-t border-amarillo/20 dark:border-yellow-600/20">
          <h4 className="text-sm font-semibold text-gris-oscuro dark:text-gray-100 mb-3">
            🏷️ Desglose por Tipo de Cupón
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                General: <span className="font-semibold">{cupones.filter(c => c.tipo_cupon === 'general' || !c.tipo_cupon).length}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                1ª Compra: <span className="font-semibold">{cupones.filter(c => c.only_first_purchase).length}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Cumpleaños: <span className="font-semibold">{cupones.filter(c => c.es_cumpleanos).length}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Retorno: <span className="font-semibold">{cupones.filter(c => c.es_carrito_abandonado).length}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Referidos: <span className="font-semibold">{cupones.filter(c => c.tipo_cupon === 'referido').length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Top 3 Cupones Más Usados */}
        {cupones.length > 0 && (
          <div className="mt-6 pt-6 border-t border-amarillo/20 dark:border-yellow-600/20">
            <h4 className="text-sm font-semibold text-gris-oscuro dark:text-gray-100 mb-3">
              🏆 Top 3 Cupones Más Usados
            </h4>
            <div className="space-y-2">
              {cupones
                .filter(c => (c.veces_usado || 0) > 0)
                .sort((a, b) => (b.veces_usado || 0) - (a.veces_usado || 0))
                .slice(0, 3)
                .map((cupon, index) => (
                  <div key={cupon.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gris-oscuro dark:text-gray-100">
                          {cupon.codigo}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {cupon.tipo === 'porcentaje' ? `${cupon.valor}% descuento` : `S/ ${cupon.valor} descuento`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        💰 S/ {(cupon.total_descuento_aplicado || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {cupon.veces_usado || 0} usos
                      </p>
                    </div>
                  </div>
                ))}
              {cupones.filter(c => (c.veces_usado || 0) > 0).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No hay cupones usados todavía
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Cupones */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mínimo
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expira
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {cupones.map((cupon) => {
                const cuponStats = stats.get(cupon.id)
                return (
                  <tr key={cupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
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
                          {/* Badges para tipo de cupón especial */}
                          <div className="flex gap-1 mt-1">
                            {cupon.only_first_purchase && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                1ª Compra
                              </span>
                            )}
                            {cupon.es_cumpleanos && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                                🎂 Cumple
                              </span>
                            )}
                            {cupon.es_carrito_abandonado && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                🛒 Retorno
                              </span>
                            )}
                            {cupon.categoria && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                {cupon.categoria}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cupon.tipo === 'porcentaje'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {cupon.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-gris-oscuro dark:text-gray-100">
                      {cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `S/ ${cupon.valor.toFixed(2)}`}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm text-gris-oscuro dark:text-gray-100">
                        {cupon.usos_actuales || 0} / {cupon.usos_maximos || '∞'}
                      </div>
                      {cuponStats && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Users className="w-3 h-3 mr-1" />
                          {cuponStats.usuarios_unicos} usuarios
                        </div>
                      )}
                      {/* Mostrar estadísticas avanzadas si existen */}
                      {(cupon.veces_usado !== undefined && cupon.veces_usado > 0) && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          💰 S/ {(cupon.total_descuento_aplicado || 0).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gris-oscuro dark:text-gray-100">
                      S/ {cupon.monto_minimo?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {cupon.fecha_expiracion ? (
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(cupon.fecha_expiracion).toLocaleDateString('es-PE')}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">Sin expiración</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
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
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center space-x-2">
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

                {/* NUEVOS CAMPOS AVANZADOS */}
                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Tipo de Cupón
                  </label>
                  <select
                    name="tipo_cupon"
                    value={formData.tipo_cupon}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="general">General</option>
                    <option value="primera_compra">Primera Compra</option>
                    <option value="cumpleanos">Cumpleaños</option>
                    <option value="carrito_abandonado">Carrito Abandonado</option>
                    <option value="referido">Referido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gris-oscuro dark:text-gray-200 mb-2">
                    Categoría Específica
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Todas las categorías</option>
                    <option value="Decoración">Decoración</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Electrónica">Electrónica</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Juguetes">Juguetes</option>
                    <option value="Libros">Libros</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Deja en blanco para aplicar a todas
                  </p>
                </div>
              </div>

              {/* Checkboxes Especiales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="only_first_purchase"
                    name="only_first_purchase"
                    checked={formData.only_first_purchase}
                    onChange={(e) => setFormData(prev => ({ ...prev, only_first_purchase: e.target.checked }))}
                    className="text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                  />
                  <label htmlFor="only_first_purchase" className="text-sm text-gray-700 dark:text-gray-300">
                    Solo primera compra
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="es_cumpleanos"
                    name="es_cumpleanos"
                    checked={formData.es_cumpleanos}
                    onChange={(e) => setFormData(prev => ({ ...prev, es_cumpleanos: e.target.checked }))}
                    className="text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                  />
                  <label htmlFor="es_cumpleanos" className="text-sm text-gray-700 dark:text-gray-300">
                    Cupón de cumpleaños
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="es_carrito_abandonado"
                    name="es_carrito_abandonado"
                    checked={formData.es_carrito_abandonado}
                    onChange={(e) => setFormData(prev => ({ ...prev, es_carrito_abandonado: e.target.checked }))}
                    className="text-amarillo dark:text-yellow-400 focus:ring-amarillo dark:focus:ring-yellow-400"
                  />
                  <label htmlFor="es_carrito_abandonado" className="text-sm text-gray-700 dark:text-gray-300">
                    Recuperar carrito abandonado
                  </label>
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
