import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase, Usuario } from '@/lib/supabase'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'

interface AuthContextType {
  user: Usuario | null
  isAdmin: boolean
  isLoading: boolean
  error: string | null // Añadido para manejar errores de autenticación/carga de usuario
  updateUser: (userData: Partial<Usuario>) => Promise<void>
  logout: () => Promise<void> // Añadimos la función de logout
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
  const { session, isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth() // Añadir isClerkLoaded y isSignedIn

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
          if (supabaseFetchError.code === '401') {
            setError('No autorizado. Por favor, asegúrate de haber iniciado sesión y tener los permisos correctos.')
          } else if (supabaseFetchError.code === '406') {
            setError('Solicitud no aceptable. Verifica la configuración de la base de datos o los datos enviados.')
          } else {
            setError('Error al cargar la información del usuario. Inténtalo más tarde.')
          }
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

  // Efecto para sincronizar la sesión de Clerk con Supabase
  useEffect(() => {
    if (!isClerkLoaded) return; // Esperar a que Clerk cargue su sesión

    if (isSignedIn && session?.accessToken) {
      supabase.auth.setSession({
        access_token: session.accessToken,
        refresh_token: session.refreshToken || '',
      }).then(({ error }) => {
        if (error) {
          console.error('Error al establecer la sesión de Supabase:', error)
          setError('Error de autenticación: No se pudo sincronizar la sesión.')
        }
      })
    } else if (isClerkLoaded && !isSignedIn) {
      // Clerk está cargado pero el usuario no ha iniciado sesión, limpiar la sesión de Supabase
      supabase.auth.setSession({ access_token: null, refresh_token: null }).then(({ error }) => {
        if (error) {
          console.error('Error al limpiar la sesión de Supabase:', error)
        }
      })
    }
  }, [session?.accessToken, session?.refreshToken, isClerkLoaded, isSignedIn]) // Añadir dependencias

  const isAdmin = user?.rol === 'admin'

  const logout = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        // Captura específicamente AuthSessionMissingError si Supabase lo lanza
        if (signOutError.message.includes('Auth session missing')) {
          console.warn('AuthContext: Intento de cerrar sesión sin sesión activa en Supabase.')
        } else {
          console.error('AuthContext: Error al cerrar sesión en Supabase:', signOutError)
          setError('Error al cerrar sesión. Inténtalo de nuevo.')
        }
        return
      }
      setUser(null)
      setError(null)
      // Clerk ya maneja su propio estado de desautenticación, no necesitamos llamar a su logout aquí
    } catch (err) {
      console.error('AuthContext: Error inesperado durante el logout:', err)
      setError('Ocurrió un error inesperado al intentar cerrar sesión.')
    }
  }

  const value: AuthContextType = {
    user,
    isAdmin,
    isLoading,
    error, // Exponer el estado de error
    updateUser,
    logout, // Exponer la función de logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


