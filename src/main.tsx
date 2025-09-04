import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

import { env } from '@/config/env'

// Importa los componentes de Clerk para las rutas de autenticación
import { SignIn, SignUp } from '@clerk/clerk-react'

// Importa los componentes de tus páginas y ProtectedRoute
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ProtectedRoute from './components/Auth/ProtectedRoute'

// Definimos el router principal fuera del componente para mejor rendimiento y compatibilidad con v7
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> }, // Ruta para la página de inicio
      { path: "catalogo", element: <Catalog /> },
      { path: "producto/:id", element: <Product /> },
      { path: "carrito", element: <Cart /> },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "perfil",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/*",
        element: (
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/sign-in/*", // Ruta para iniciar sesión
    element: <SignIn routing="path" path="/sign-in" />,
  },
  {
    path: "/sign-up/*", // Ruta para registrarse
    element: <SignUp routing="path" path="/sign-up" />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={env.CLERK_PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>,
)


