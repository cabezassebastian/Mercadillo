import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <img 
              src="/logo.jpg" 
              alt="Mercadillo Lima Perú" 
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl mb-4 sm:mb-6 object-cover" 
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-sm sm:text-base text-gris-claro dark:text-gray-400">
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
                socialButtonsBlockButton: "bg-hueso dark:bg-gray-700 text-gris-oscuro dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 mb-4 border border-gray-300 dark:border-gray-600 text-sm sm:text-base min-h-[44px]",
                socialButtonsBlockButtonText: "font-medium text-gris-oscuro dark:text-gray-200 text-sm sm:text-base",
                dividerLine: "bg-gray-300 dark:bg-gray-600 my-4 sm:my-6",
                dividerText: "text-gris-claro dark:text-gray-400 text-xs sm:text-sm px-4 bg-white dark:bg-gray-800",
                formButtonPrimary: "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200 bg-amarillo text-gray-900 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 no-underline hover:no-underline focus:no-underline appearance-none shadow-none focus:outline-none focus:ring-0 w-full min-h-[44px] text-sm sm:text-base",
                formFieldInput: "border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-amarillo focus:border-amarillo transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px] text-sm sm:text-base",
                formFieldLabel: "text-gris-oscuro dark:text-gray-200 font-medium mb-2 block text-left text-sm sm:text-base",
                footerActionLink: "text-amarillo hover:text-dorado font-medium transition-colors duration-200",
                footerAction: "text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gris-claro dark:text-gray-400 bg-white dark:bg-gray-800",
                footer: "bg-white dark:bg-gray-800",
                footerPages: "bg-white dark:bg-gray-800",
                footerText: "text-gris-claro dark:text-gray-400 bg-white dark:bg-gray-800",
                footerActionText: "text-gris-claro dark:text-gray-400 bg-white dark:bg-gray-800",
                footerActionLinkText: "text-amarillo hover:text-dorado bg-white dark:bg-gray-800",
                modalContent: "bg-white dark:bg-gray-800",
                modalCloseButton: "text-gris-claro dark:text-gray-400",
                closeButton: "hidden",
              },
              variables: {
                colorPrimary: "#fbbf24",
                colorText: "#111827",
                colorBackground: "inherit",
                colorInputBackground: "#ffffff",
                colorInputText: "#111827",
                colorNeutral: "#6b7280",
                borderRadius: "0.75rem",
                fontFamily: "Inter, sans-serif",
                spacingUnit: "1rem",
                colorDanger: "#ef4444",
                colorSuccess: "#10b981",
                colorWarning: "#f59e0b",
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
