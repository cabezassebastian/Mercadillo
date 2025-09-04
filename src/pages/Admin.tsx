import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  Upload
} from 'lucide-react'
import AdminProducts from '../components/Admin/AdminProducts'
import AdminOrders from '../components/Admin/AdminOrders'
import AdminUsers from '../components/Admin/AdminUsers'
import AdminDashboard from '../components/Admin/AdminDashboard'

const Admin: React.FC = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/admin', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/productos', icon: Package, label: 'Productos' },
    { path: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  ]

  return (
    <div className="min-h-screen bg-hueso">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gris-oscuro">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Gestiona tu tienda online desde aquí
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="card p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                          isActive
                            ? 'bg-amarillo text-gris-oscuro'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/productos" element={<AdminProducts />} />
              <Route path="/pedidos" element={<AdminOrders />} />
              <Route path="/usuarios" element={<AdminUsers />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin


