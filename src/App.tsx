import { Outlet, useLocation } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import { useClerk } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
// Eliminamos la importación de CustomToastNotification
// import CustomToastNotification from './components/CustomToastNotification'

function App() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  )
}

// Eliminamos el componente CustomErrorToast, lo crearemos en otro archivo
// const CustomErrorToast: React.FC<{ t: Toast }> = ({ t }) => (
//   <div
//     className={`${
//       t.visible ? 'animate-enter' : 'animate-leave'
//     } bg-[#FEF3C7] border border-[#FBBF24] text-[#92400E] p-3 rounded-lg shadow-md flex items-center space-x-2`}
//     style={{
//       backgroundColor: "#FEF3C7", // Amarillo muy claro
//       color: "#92400E",     // Marrón oscuro para el texto
//       borderColor: "#FBBF24", // Borde amarillo oscuro
//       borderRadius: "8px",
//     }}
//   >
//     <span>⚠️ No has iniciado sesión. Por favor inicia sesión para continuar.</span>
//   </div>
// );

const AuthContent: React.FC = () => {
  // Eliminamos los estados showCustomToast y customToastMessage
  // Eliminamos la desestructuración de user, error, isLoading, redirectToSignIn y location ya que no se usan.
  // const { user, error, isLoading } = useAuth()
  // const { redirectToSignIn } = useClerk()
  // const location = useLocation()

  // Eliminamos el useEffect que gestionaba el toast
  // useEffect(() => {
  //   if (!isLoading && !user && error === 'Usuario no autenticado o ID no disponible.') {
  //     const isAuthPage = location.pathname.startsWith('/sign-in') || location.pathname.startsWith('/sign-up');
  //     if (!isAuthPage) {
  //       setShowCustomToast(true);
  //       setCustomToastMessage("⚠️ No has iniciado sesión. Por favor inicia sesión para continuar.");
  //       const timer = setTimeout(() => {
  //         setShowCustomToast(false);
  //         setCustomToastMessage("");
  //       }, 4000);
  //       return () => clearTimeout(timer);
  //     }
  //   } else {
  //     setShowCustomToast(false);
  //     setCustomToastMessage("");
  //   }
  // }, [user, error, isLoading, location.pathname])

  return (
    <CartProvider>
      <Layout>
        <Outlet />
        {/* Eliminamos el renderizado condicional del CustomToastNotification */}
        {/* {showCustomToast && (
          <CustomToastNotification
            message={customToastMessage}
            onClose={() => setShowCustomToast(false)}
          />
        )} */}
      </Layout>
    </CartProvider>
  )
}
export default App


