import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Importaciones de contextos
import { ThemeProvider } from './contexts/ThemeContext'

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
      <ThemeProvider>
        <ClerkProvider
          publishableKey={clerkPubKey}
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          localization={{
            locale: "es-ES"
          }}
          appearance={{
            elements: {
              rootBox: "w-full max-w-md mx-auto",
              card: "w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden",
              headerTitle: "text-gris-oscuro dark:text-gray-100 text-2xl font-bold text-center mb-2",
              headerSubtitle: "text-gris-claro dark:text-gray-400 text-center mb-6",
              socialButtonsBlockButton: "bg-hueso dark:bg-gray-700 text-gris-oscuro dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 mb-4 border border-gray-300 dark:border-gray-600",
              socialButtonsBlockButtonText: "font-medium",
              dividerLine: "bg-gray-300 dark:bg-gray-600 my-6",
              dividerText: "text-gris-claro dark:text-gray-400 text-sm px-4 bg-white dark:bg-gray-800",
              formButtonPrimary: "bg-amarillo hover:bg-dorado text-gris-oscuro font-semibold rounded-lg py-3 px-4 w-full transition-colors duration-200",
              formFieldInput: "border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-amarillo focus:border-amarillo transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
              formFieldLabel: "text-gris-oscuro dark:text-gray-200 font-medium mb-2 block text-left",
              footerActionLink: "text-amarillo hover:text-dorado font-medium transition-colors duration-200",
              footerAction: "text-center mt-6 text-sm",
              closeButton: "text-gris-oscuro dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:ring-amarillo focus:border-amarillo",
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
              userButtonPopoverListItem: "hover:bg-hueso dark:hover:bg-gray-700 transition-colors duration-150",
              userButtonPopoverListItemText: "text-sm font-medium text-gray-900 dark:text-gray-100",
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
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
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
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)


