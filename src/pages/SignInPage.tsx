import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <img 
              src="/logo.jpg" 
              alt="Mercadillo Lima Perú" 
              className="mx-auto w-20 h-20 rounded-xl mb-6 object-cover" 
            />
            <h1 className="text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-gris-claro dark:text-gray-400">
              Inicia sesión para continuar
            </p>
          </div>
          
          <div className="clerk-continue-wrapper">
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
                socialButtonsBlockButton: "bg-hueso dark:bg-gray-700 text-gris-oscuro dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 mb-4 border border-gray-300 dark:border-gray-600",
                socialButtonsBlockButtonText: "font-medium text-gris-oscuro dark:text-gray-200",
                dividerLine: "bg-gray-300 dark:bg-gray-600 my-6",
                dividerText: "text-gris-claro dark:text-gray-400 text-sm px-4 bg-white dark:bg-gray-800",
                formButtonPrimary: "inline-flex items-center justify-center px-6 py-2 rounded-lg font-semibold transition-colors duration-200 bg-amarillo text-gray-900 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 no-underline hover:no-underline focus:no-underline appearance-none shadow-none focus:outline-none focus:ring-0",
                formFieldInput: "border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-amarillo focus:border-amarillo transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                formFieldLabel: "text-gris-oscuro dark:text-gray-200 font-medium mb-2 block text-left",
                footerActionLink: "text-amarillo hover:text-dorado font-medium transition-colors duration-200",
                footerAction: "text-center mt-6 text-sm text-gris-claro dark:text-gray-400 bg-transparent dark:bg-transparent",
                footer: "bg-transparent dark:bg-transparent",
                footerPages: "bg-transparent dark:bg-transparent",
                footerText: "text-gris-claro dark:text-gray-400 bg-transparent dark:bg-transparent",
                closeButton: "hidden",
              },
              variables: {
                colorPrimary: "#fbbf24",
                colorText: "#111827",
                colorBackground: "transparent",
                colorInputBackground: "#ffffff",
                colorInputText: "#111827",
                colorNeutral: "#6b7280",
                borderRadius: "0.75rem",
                fontFamily: "Inter, sans-serif",
                spacingUnit: "1rem",
              },
              layout: {
                unsafe_disableDevelopmentModeWarnings: true,
              }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
