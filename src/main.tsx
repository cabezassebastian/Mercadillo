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
    <ClerkProvider
      publishableKey={env.CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          rootBox: "max-w-md mx-auto my-8 p-6 bg-blanco rounded-lg shadow-xl border border-gray-200",
          card: "shadow-none border-none bg-transparent",
          headerTitle: "text-gris-oscuro",
          headerSubtitle: "text-gris-claro",
          socialButtonsBlockButton: "bg-hueso text-gris-oscuro hover:bg-gray-200",
          formButtonPrimary: "bg-amarillo hover:bg-dorado text-gris-oscuro normal-case",
          formFieldInput: "bg-hueso text-gris-oscuro focus:ring-amarillo focus:border-amarillo",
          footerActionLink: "text-amarillo hover:text-dorado",
          // Personaliza el logo
          header: {
            // Añade el logo arriba del formulario
            marginTop: "2rem",
            marginBottom: "2rem",
            textAlign: "center",
            '.cl-header::before': {
              content: '""',
              display: 'block',
              width: '100px',
              height: '100px',
              margin: '0 auto 1rem',
              backgroundImage: 'url(/logo.jpg)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            },
          },
        },
        variables: {
          colorPrimary: "#FFD700", // Amarillo
          colorText: "#333333",     // Gris oscuro
          colorBackground: "#f5f1e9", // Hueso
          colorInputBackground: "#f5f1e9", // Hueso para inputs
          colorInputText: "#333333",
          borderRadius: "0.5rem",
        }
      }}
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>,
)


