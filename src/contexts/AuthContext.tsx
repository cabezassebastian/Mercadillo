import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase, Usuario } from '@/lib/supabase'

interface AuthContextType {
  user: Usuario | null
  isAdmin: boolean
  isLoading: boolean
  error: string | null // Añadido para manejar errores de autenticación/carga de usuario
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
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Estado para errores de carga de usuario

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded) return

      setIsLoading(true)
      setError(null) // Resetear errores al iniciar la carga

      if (!clerkUser || !clerkUser.id) {
        console.warn('AuthContext: Usuario de Clerk no autenticado o ID no disponible.');
        setUser(null)
        setError('Usuario no autenticado o ID no disponible.'); // Mensaje específico para este caso
        setIsLoading(false)
        return
      }

      try {
        // Buscar usuario en Supabase
        const { data: existingUser, error: supabaseFetchError } = await supabase
          .from('usuarios')
          .select('id, email, nombre, apellido, rol') // Especificar columnas
          .eq('id', clerkUser.id)
          .single()

        if (supabaseFetchError && supabaseFetchError.code === 'PGRST116') {
          // Usuario no existe, crear nuevo usuario
          const newUser: Omit<Usuario, 'created_at'> = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            nombre: clerkUser.firstName || '',
            apellido: clerkUser.lastName || '',
            rol: 'cliente',
          }

          const { data: createdUser, error: supabaseCreateError } = await supabase
            .from('usuarios')
            .insert([newUser])
            .select('id, email, nombre, apellido, rol') // Especificar columnas también aquí
            .single()

          if (supabaseCreateError) {
            console.error('Error creating user:', supabaseCreateError)
            setError('Error al crear el perfil de usuario. Inténtalo más tarde.')
            return
          }

          setUser(createdUser)
        } else if (supabaseFetchError) {
          console.error('Error fetching user:', supabaseFetchError)
          setError('Error al cargar la información del usuario. Inténtalo más tarde.')
          return
        } else {
          setUser(existingUser)
        }
      } catch (err) {
        console.error('Error inesperado en fetchUser:', err)
        setError('Ocurrió un error inesperado al gestionar tu perfil.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [clerkUser, isLoaded])

  const updateUser = async (userData: Partial<Usuario>) => {
    if (!user) return

    try {
      const { data, error: supabaseUpdateError } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single()

      if (supabaseUpdateError) {
        console.error('Error updating user:', supabaseUpdateError)
        // Podríamos manejar este error de actualización de forma más granular si es necesario
        return
      }

      setUser(data)
    } catch (err) {
      console.error('Error inesperado en updateUser:', err)
    }
  }

  const isAdmin = user?.rol === 'admin'

  const value: AuthContextType = {
    user,
    isAdmin,
    isLoading,
    error, // Exponer el estado de error
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


