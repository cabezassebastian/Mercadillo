import React from 'react'
import { UserProfile } from '@clerk/clerk-react'

const UserProfileSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Configuración de Cuenta
        </h1>
        
        <div className="max-w-5xl">
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-lg border-0 rounded-lg overflow-hidden",
                navbar: "bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700",
                navbarButton: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md",
                navbarButtonActive: "bg-yellow-500 text-gray-900 hover:bg-yellow-600",
                profileSection: "bg-white dark:bg-gray-800",
                profileSectionContent: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6",
                profileSectionTitle: "text-gray-900 dark:text-gray-100 text-xl font-semibold",
                profileSectionSubtitle: "text-gray-600 dark:text-gray-400",
                profileSectionPrimaryButton: "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold",
                formButtonPrimary: "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg shadow-sm",
                formFieldInput: "border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500",
                formFieldLabel: "text-gray-900 dark:text-gray-100 font-medium text-sm",
                badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-1 text-xs",
                avatarBox: "w-20 h-20 rounded-full",
                pageScrollBox: "bg-white dark:bg-gray-800"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default UserProfileSettings