import { Outlet } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider, useAuth } from './contexts/AuthContext' // Importa useAuth
import Layout from './components/Layout/Layout'

function App() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  )
}

// Componente auxiliar para usar useAuth dentro de AuthProvider
const AuthContent: React.FC = () => {
  const { error } = useAuth()

  return (
    <CartProvider>
      <Layout>
        {error && (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-rojo-claro rounded-lg shadow-md max-w-md mx-auto my-4">
            <p className="text-xl font-semibold text-rojo-oscuro mb-4">⚠️ Error de Autenticación</p>
            <p className="text-gray-700">{error}</p>
            <p className="text-sm text-gray-500 mt-2">Por favor, recarga la página o inténtalo de nuevo más tarde.</p>
          </div>
        )}
        <Outlet />
      </Layout>
    </CartProvider>
  )
}

export default App


