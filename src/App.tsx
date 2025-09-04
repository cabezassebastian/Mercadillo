import { Outlet } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Outlet />
        </Layout>
      </CartProvider>
    </AuthProvider>
  )
}

export default App


