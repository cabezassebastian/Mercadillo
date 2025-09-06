import { SignIn } from "@clerk/clerk-react";
import React from "react";

const SignInPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <img src="/logo.jpg" alt="Logo" className="mx-auto w-20 mb-4" />
        <SignIn
          appearance={{
            elements: {
              card: "shadow-none w-full p-0", // Desactivar estilos de tarjeta predeterminados de Clerk aquí
              formButtonPrimary:
                "bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg py-2",
              formFieldInput:
                "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400",
              // Asegurarse de que el botón de cerrar sea visible y esté bien posicionado en mobile
              closeButton: "z-50 text-gris-oscuro top-4 right-4 focus:ring-amarillo focus:border-amarillo",
              headerTitle: "text-gris-oscuro",
              headerSubtitle: "text-gris-claro",
              socialButtonsBlockButton: "bg-hueso text-gris-oscuro hover:bg-gray-200",
              footerActionLink: "text-amarillo hover:text-dorado",
            },
            variables: {
                colorPrimary: "#FFD700", // Amarillo
                colorText: "#333333",     // Gris oscuro
                colorBackground: "#f5f1e9", // Hueso
                colorInputBackground: "#f5f1e9", // Hueso para inputs
                colorInputText: "#333333",
                borderRadius: "0.5rem",
                fontFamily: "Inter, sans-serif", // Tipografía moderna
              }
          }}
        />
      </div>
    </div>
  );
};

export default SignInPage;
