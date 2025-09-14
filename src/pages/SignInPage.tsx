import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-hueso flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <img 
              src="/logo.jpg" 
              alt="Mercadillo Lima Perú" 
              className="mx-auto w-20 h-20 rounded-xl mb-6 object-cover" 
            />
            <h1 className="text-2xl font-bold text-gris-oscuro mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-gris-claro">
              Inicia sesión para continuar
            </p>
          </div>
          
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
            appearance={{
              elements: {
                card: "shadow-none bg-transparent p-0 w-full",
                rootBox: "w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-hueso text-gris-oscuro hover:bg-gray-200 w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 mb-4 border border-gray-300",
                socialButtonsBlockButtonText: "font-medium",
                dividerLine: "bg-gray-300 my-6",
                dividerText: "text-gris-claro text-sm px-4 bg-white",
                formButtonPrimary: "bg-amarillo hover:bg-dorado text-gris-oscuro font-semibold rounded-lg py-3 px-4 w-full transition-colors duration-200",
                formFieldInput: "border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-amarillo focus:border-amarillo transition-all duration-200",
                formFieldLabel: "text-gris-oscuro font-medium mb-2 block text-left",
                footerActionLink: "text-amarillo hover:text-dorado font-medium transition-colors duration-200",
                footerAction: "text-center mt-6 text-sm",
                closeButton: "hidden",
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
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
