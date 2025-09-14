import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
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
              Crear cuenta
            </h1>
            <p className="text-gris-claro dark:text-gray-400">
              Únete a nuestro mercadillo
            </p>
          </div>
          
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
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
                formButtonPrimary: "bg-amarillo hover:bg-dorado text-gris-oscuro dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border dark:border-gray-600 font-semibold rounded-lg py-3 px-4 w-full transition-colors duration-200 no-underline hover:no-underline focus:no-underline active:no-underline !outline-none !shadow-none",
                formFieldInput: "border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-amarillo focus:border-amarillo transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                formFieldLabel: "text-gris-oscuro dark:text-gray-200 font-medium mb-2 block text-left",
                footerActionLink: "text-amarillo hover:text-dorado font-medium transition-colors duration-200",
                footerAction: "text-center mt-6 text-sm text-gris-claro dark:text-gray-400",
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
              },
              layout: {
                unsafe_disableDevelopmentModeWarnings: true,
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
