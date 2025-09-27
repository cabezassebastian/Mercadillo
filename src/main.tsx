import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { esES } from '@clerk/localizations'
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
import AboutPage from './pages/AboutPage'

// Paginas de autenticacion de Clerk
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import NotFound404 from './pages/NotFound404'

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
      { path: "sobre-nosotros", element: <AboutPage /> },
      // Página 404 - debe ir al final como catch-all
      { path: "*", element: <NotFound404 /> },
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
          localization={esES}
          appearance={{
            baseTheme: undefined,
            elements: {
              rootBox: "w-full max-w-md mx-auto bg-white dark:bg-gray-800",
              card: "w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden",
              headerTitle: "text-gris-oscuro dark:text-gray-100 text-2xl font-bold text-center mb-2",
              headerSubtitle: "text-gris-claro dark:text-gray-400 text-center mb-6",
              socialButtonsBlockButton: "bg-hueso dark:bg-gray-700 text-gris-oscuro dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 mb-4 border border-gray-300 dark:border-gray-600",
              socialButtonsBlockButtonText: "font-medium text-gris-oscuro dark:text-gray-200",
              dividerLine: "bg-gray-300 dark:bg-gray-600 my-6",
              dividerText: "text-gris-claro dark:text-gray-400 text-sm px-4 bg-white dark:bg-gray-800",
              formButtonPrimary: "bg-amarillo hover:bg-dorado text-gris-oscuro font-semibold rounded-lg py-3 px-4 w-full transition-colors duration-200",
              formFieldInput: "border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-amarillo focus:border-amarillo transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
              formFieldLabel: "text-gris-oscuro dark:text-gray-200 font-medium mb-2 block text-left",
              footerActionLink: "text-amarillo hover:text-dorado font-medium transition-colors duration-200",
              footerAction: "text-center mt-6 text-sm text-gris-claro dark:text-gray-400",
              closeButton: "text-gris-oscuro dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:ring-amarillo focus:border-amarillo",
              // Configuración específica para el UserButton popup
              userButtonPopoverCard: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl",
              userButtonPopoverActions: "bg-white dark:bg-gray-800",
              userButtonPopoverActionButton: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150",
              userButtonPopoverActionButtonText: "text-gray-700 dark:text-gray-300",
              userButtonPopoverFooter: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
              // Avatar y elementos relacionados
              avatarBox: "border-2 border-amarillo dark:border-yellow-400",
              userButtonAvatarBox: "border-2 border-transparent hover:border-amarillo dark:hover:border-yellow-400 transition-colors duration-200",
              // Elementos adicionales para mejor soporte de modo oscuro
              modalContent: "bg-white dark:bg-gray-800",
              modalCloseButton: "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
              formFieldHintText: "text-gray-500 dark:text-gray-400",
              formFieldSuccessText: "text-green-600 dark:text-green-400",
              formFieldErrorText: "text-red-600 dark:text-red-400",
              identityPreviewText: "text-gray-600 dark:text-gray-300",
              identityPreviewEditButton: "text-amarillo dark:text-yellow-400 hover:text-dorado dark:hover:text-yellow-300",
              // Elementos específicos para UserProfile
              userProfile: "bg-white dark:bg-gray-800",
              profileSection: "bg-white dark:bg-gray-800",
              profileSectionContent: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              profileSectionTitle: "text-gray-900 dark:text-gray-100",
              profileSectionSubtitle: "text-gray-600 dark:text-gray-400",
              profileSectionPrimaryButton: "bg-amarillo hover:bg-dorado text-gris-oscuro",
              navbar: "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
              navbarButton: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
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


