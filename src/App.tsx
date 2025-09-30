import { Outlet } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout/Layout'
import ClerkDarkMode from './components/ClerkDarkMode'
import NotificationContainer from './components/common/NotificationContainer'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthContent />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

const AuthContent: React.FC = () => {
  return (
    <NotificationProvider>
      <CartProvider>
        <ClerkDarkMode />
        <Layout>
          <Outlet />
        </Layout>
        <NotificationContainer />
      </CartProvider>
    </NotificationProvider>
  )
}

export default App


