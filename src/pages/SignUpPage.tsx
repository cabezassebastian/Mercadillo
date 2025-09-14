import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-hueso p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md text-center">
        <img src="/logo.jpg" alt="Mercadillo Lima Perú" className="mx-auto w-16 sm:w-20 mb-4 rounded-lg" />
        <h1 className="text-xl sm:text-2xl font-bold text-gris-oscuro mb-2">Crear cuenta</h1>
        <p className="text-gris-claro text-sm sm:text-base mb-6">Únete a nuestro mercadillo</p>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              card: "shadow-none w-full p-0 bg-transparent",
              rootBox: "w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-hueso text-gris-oscuro hover:bg-gray-200 w-full py-3 rounded-lg font-medium transition-colors duration-200 mb-3 text-sm sm:text-base",
              socialButtonsBlockButtonText: "text-sm sm:text-base font-medium",
              dividerLine: "bg-gray-300 my-4",
              dividerText: "text-gris-claro text-sm px-4 bg-white",
              formButtonPrimary: "bg-amarillo hover:bg-dorado text-gris-oscuro font-semibold rounded-lg py-3 w-full text-sm sm:text-base transition-colors duration-200",
              formFieldInput: "border border-gray-300 rounded-lg px-3 py-3 w-full focus:ring-2 focus:ring-amarillo focus:border-amarillo text-sm sm:text-base",
              formFieldLabel: "text-gris-oscuro font-medium mb-2 block text-sm sm:text-base text-left",
              footerActionLink: "text-amarillo hover:text-dorado font-medium text-sm sm:text-base",
              footerAction: "text-center mt-6",
              closeButton: "hidden",
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
        />
      </div>
    </div>
  );
};

export default SignUpPage;
