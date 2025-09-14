import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

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
import AuthSync from './components/AuthSync'; // Importa el nuevo componente AuthSync

// Páginas adicionales
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import ShippingPage from './pages/ShippingPage'
import ContactPage from './pages/ContactPage'

// Paginas de autenticacion de Clerk
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'

// Configuracion del router principal
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
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
      // Páginas adicionales
      { path: "terminos", element: <TermsPage /> },
      { path: "privacidad", element: <PrivacyPage /> },
      { path: "envios", element: <ShippingPage /> },
      { path: "contacto", element: <ContactPage /> },
    ],
  },
  {
    path: "/sign-in/*",
    element: <SignInPage />,
  },
  {
    path: "/sign-up/*",
    element: <SignUpPage />,
  },
]);

// Configuracion de Clerk para desarrollo y produccion
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ""

if (!clerkPubKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={clerkPubKey}
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        localization={{
          locale: "es-ES"
        }}
        appearance={{
          elements: {
            rootBox: "w-full max-w-md mx-auto px-4",
            card: "w-full max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8",
            headerTitle: "text-gris-oscuro text-xl sm:text-2xl font-bold text-center mb-2",
            headerSubtitle: "text-gris-claro text-sm sm:text-base text-center mb-6",
            socialButtonsBlockButton: "bg-hueso text-gris-oscuro hover:bg-gray-200 w-full py-3 rounded-lg font-medium transition-colors duration-200 mb-3",
            socialButtonsBlockButtonText: "text-sm sm:text-base",
            dividerLine: "bg-gray-300",
            dividerText: "text-gris-claro text-sm",
            formButtonPrimary: "bg-amarillo hover:bg-dorado text-gris-oscuro font-semibold rounded-lg py-3 w-full text-sm sm:text-base transition-colors duration-200",
            formFieldInput: "border border-gray-300 rounded-lg px-3 py-3 w-full focus:ring-2 focus:ring-amarillo focus:border-amarillo text-sm sm:text-base",
            formFieldLabel: "text-gris-oscuro font-medium mb-2 block text-sm sm:text-base",
            footerActionLink: "text-amarillo hover:text-dorado font-medium",
            closeButton: "z-50 text-gris-oscuro hover:text-gray-600 focus:ring-amarillo focus:border-amarillo",
            userButtonPopoverCard: {
              width: "280px",
              maxWidth: "calc(100vw - 2rem)",
              borderRadius: "12px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              fontSize: "14px",
              padding: "8px",
              backgroundColor: "white", 
              border: "1px solid rgb(229 231 235)",
            },
            userButtonPopoverListItem: "hover:bg-hueso transition-colors duration-150",
            userButtonPopoverListItemText: "text-sm font-medium",
            userButtonPopoverActionButton: {
              padding: "6px 12px",
              fontSize: "14px",
              borderRadius: "8px",
            },
            userButtonPopoverFooter: {
              fontSize: "12px",
              marginTop: "8px",
              color: "#666",
            },
          },
          variables: {
            colorPrimary: "#FFD700",
            colorText: "#333333",
            colorBackground: "#f8f9fa",
            colorInputBackground: "#f8f9fa",
            colorInputText: "#333333",
            colorNeutral: "#666666",
            borderRadius: "0.75rem",
            fontFamily: "Inter, sans-serif",
            spacingUnit: "1rem",
          }
        }}
      >
        <AuthSync /> {/* Renderiza AuthSync aqui */}
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)


