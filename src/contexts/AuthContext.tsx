import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { supabase, Usuario } from '@/lib/supabase'

interface AuthContextType {
  user: Usuario | null
  isAdmin: boolean
  isLoading: boolean
  updateUser: (userData: Partial<Usuario>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded) return

      if (!clerkUser) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        // Buscar usuario en Supabase
        const { data: existingUser, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', clerkUser.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // Usuario no existe, crear nuevo usuario
          const newUser: Omit<Usuario, 'created_at'> = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            nombre: clerkUser.firstName || '',
            apellido: clerkUser.lastName || '',
            rol: 'cliente',
          }

          const { data: createdUser, error: createError } = await supabase
            .from('usuarios')
            .insert([newUser])
            .select()
            .single()

          if (createError) {
            console.error('Error creating user:', createError)
            return
          }

          setUser(createdUser)
        } else if (error) {
          console.error('Error fetching user:', error)
          return
        } else {
          setUser(existingUser)
        }
      } catch (error) {
        console.error('Error in fetchUser:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [clerkUser, isLoaded])

  const updateUser = async (userData: Partial<Usuario>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return
      }

      setUser(data)
    } catch (error) {
      console.error('Error in updateUser:', error)
    }
  }

  const isAdmin = user?.rol === 'admin'

  const value: AuthContextType = {
    user,
    isAdmin,
    isLoading,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


