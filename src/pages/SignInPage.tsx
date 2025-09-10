import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <img src="/logo.jpg" alt="Logo" className="mx-auto w-20 mb-4" />
        <SignIn
          path="/sign-in" // Ruta de autenticacion
          routing="path" // Usa el enrutamiento basado en la ruta
          signUpUrl="/sign-up" // URL para la pagina de registro
          fallbackRedirectUrl="/" // URL a la que redirigir despues de iniciar sesion
          appearance={{
            elements: {
              card: "shadow-none w-full p-0", // Deshabilita estilos de tarjeta predeterminados de Clerk
              formButtonPrimary:
                "bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg py-2",
              formFieldInput:
                "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400",
              // Asegura que el boton de cerrar sea visible y este bien posicionado en moviles
              closeButton: "z-50 text-gris-oscuro top-4 right-4 focus:ring-amarillo focus:border-amarillo",
              headerTitle: "text-gris-oscuro",
              headerSubtitle: "text-gris-claro",
              socialButtonsBlockButton: "bg-hueso text-gris-oscuro hover:bg-gray-200",
              footerActionLink: "text-amarillo hover:text-dorado",
            },
            variables: {
                colorPrimary: "#FFD700", // Amarillo principal
                colorText: "#333333",     // Gris oscuro para texto
                colorBackground: "#f5f1e9", // Color de fondo hueso
                colorInputBackground: "#f5f1e9", // Fondo de inputs hueso
                colorInputText: "#333333", // Color de texto de inputs
                borderRadius: "0.5rem", // Bordes redondeados
                fontFamily: "Inter, sans-serif", // Fuente moderna
              }
          }}
        />
      </div>
    </div>
  );
};

export default SignInPage;
