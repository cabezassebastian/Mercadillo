import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

import { env } from '@/config/env'

// Importaciones de paginas y rutas protegidas
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Paginas de autenticacion de Clerk
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'

// Configuracion del router principal
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> }, // Ruta de inicio
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
    path: "/sign-in/*", // Ruta para iniciar sesion
    element: <SignInPage />,
  },
  {
    path: "/sign-up/*", // Ruta para registrarse
    element: <SignUpPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary> {/* Envuelve toda la aplicacion con ErrorBoundary */}
      <ClerkProvider
        publishableKey={env.CLERK_PUBLISHABLE_KEY}
        appearance={{
          elements: {
            rootBox: "", // Limpia rootBox para evitar un doble panel
            headerTitle: "text-gris-oscuro",
            headerSubtitle: "text-gris-claro",
            socialButtonsBlockButton: "bg-hueso text-gris-oscuro hover:bg-gray-200",
            formButtonPrimary: "bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg py-2", // Botones personalizados
            formFieldInput: "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400", // Inputs personalizados
            footerActionLink: "text-amarillo hover:text-dorado",
            // Asegura que el boton de cerrar sea visible y este bien posicionado
            closeButton: "z-50 text-gris-oscuro top-4 right-4 focus:ring-amarillo focus:border-amarillo",
            // Estilos para el dropdown del UserButton
            userButtonPopoverCard: {
              width: "220px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: "14px",
              padding: "6px",
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
          },
          variables: {
            colorPrimary: "#FFD700", // Amarillo
            colorText: "#333333",     // Gris oscuro
            colorBackground: "#f5f1e9", // Hueso
            colorInputBackground: "#f5f1e9", // Hueso para inputs
            colorInputText: "#333333",
            borderRadius: "0.5rem",
            fontFamily: "Inter, sans-serif", // Tipografia moderna
          }
        }}
        layout={{ // Propiedades de layout para Clerk
          socialButtonsVariant: "iconButton", // Botones sociales compactos
        }}
      >
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)


