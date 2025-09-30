import React from 'react'
import { UserProfile } from '@clerk/clerk-react'

const UserProfileSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Configuración de Cuenta
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none border-0",
                  navbar: "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  navbarButton: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                  profileSection: "bg-white dark:bg-gray-800",
                  profileSectionContent: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                  profileSectionTitle: "text-gray-900 dark:text-gray-100",
                  profileSectionSubtitle: "text-gray-600 dark:text-gray-400",
                  profileSectionPrimaryButton: "bg-yellow-500 hover:bg-yellow-600 text-gray-900",
                  formButtonPrimary: "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg",
                  formFieldInput: "border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                  formFieldLabel: "text-gray-900 dark:text-gray-100 font-medium",
                  badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileSettings