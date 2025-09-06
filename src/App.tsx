import { Outlet } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'

function App() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  )
}

const AuthContent: React.FC = () => {
  return (
    <CartProvider>
      <Layout>
        <Outlet />
      </Layout>
    </CartProvider>
  )
}

export default App


