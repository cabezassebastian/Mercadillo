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
import ErrorBoundary from './components/ErrorBoundary' // Importar ErrorBoundary

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
    <ErrorBoundary> {/* Envolvemos toda la aplicación con ErrorBoundary */}
      <ClerkProvider
        publishableKey={env.CLERK_PUBLISHABLE_KEY}
        appearance={{
          elements: {
            rootBox: "", // Limpiamos rootBox para evitar el doble panel
            modalBackdrop: "bg-black/50 fixed inset-0 flex items-center justify-center z-50",
            card: "bg-white rounded-2xl shadow-xl p-6 w-[95%] mx-auto relative sm:max-w-lg md:max-w-3xl lg:max-w-4xl", // Estilos para el modal principal
            headerTitle: "text-gris-oscuro",
            headerSubtitle: "text-gris-claro",
            socialButtonsBlockButton: "bg-hueso text-gris-oscuro hover:bg-gray-200",
            formButtonPrimary: "bg-amarillo hover:bg-dorado text-gris-oscuro normal-case",
            formFieldInput: "bg-hueso text-gris-oscuro focus:ring-amarillo focus:border-amarillo",
            footerActionLink: "text-amarillo hover:text-dorado",
            // Asegurar que el botón de cerrar sea visible y esté bien posicionado
            closeButton: "z-50 text-gris-oscuro top-4 right-4 focus:ring-amarillo focus:border-amarillo",
            // Estilos para el dropdown del UserButton
            userButtonPopoverCard: {
              width: "220px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: "14px",
              padding: "6px",
              // Mantener clases de Tailwind para fondo y bordes si no se sobrescriben directamente
              backgroundColor: "white", 
              border: "1px solid rgb(229 231 235)", // gray-200 en Tailwind
            },
            userButtonPopoverListItem: {},
            userButtonPopoverListItemText: "text-sm",
            userButtonPopoverListItemHover: "bg-gray-100",
            userButtonPopoverActionButton: {
              padding: "4px 8px",
              fontSize: "14px",
            },
            userButtonPopoverFooter: {
              fontSize: "11px",
              marginTop: "4px",
            },
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
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)


