import { Outlet } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import ClerkDarkMode from './components/ClerkDarkMode'

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
      <ClerkDarkMode />
      <Layout>
        <Outlet />
      </Layout>
    </CartProvider>
  )
}

export default App


