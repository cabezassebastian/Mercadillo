import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useSession } from '@clerk/clerk-react'
import { UserResource } from '@clerk/types'
import { supabaseWithAuth as globalSupabase } from "@/lib/supabaseWithAuth"; // Cliente Supabase personalizado

// Interface para Usuario (movida desde supabase.ts para evitar dependencia circular)
export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  telefono?: string
  direccion?: string
  rol: 'cliente' | 'admin'
  created_at: string
}

interface AuthContextType {
  clerkUser: UserResource | null | undefined;
  user: Usuario | null; // Renombrado de supabaseUser a user
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean | undefined;
  error: string | null;
  updateUser: (userData: Partial<Usuario>) => Promise<void>;
  logout: () => Promise<void>;
  supabaseAuthenticatedClient: any;
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
  const [user, setUser] = useState<Usuario | null>(null) // Renombrado de supabaseUser a user
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoaded: isClerkLoaded, isSignedIn: isAuthenticated } = useSession()

  const [supabaseAuthenticatedClient, setSupabaseAuthenticatedClient] = useState<any>(null);

  // Se elimina getClerkTokenForSupabase y el useEffect de initializeSupabaseClient
  // porque AuthSync se encarga de la sincronizacion de la sesion de Supabase.

  useEffect(() => {
    // Establecer supabaseAuthenticatedClient basado en el estado de autentacion de Clerk
    if (isClerkLoaded) {
      if (isAuthenticated) {
        setSupabaseAuthenticatedClient(globalSupabase); // Si esta autenticado en Clerk, usa el cliente global
        // console.log("AuthContext: Cliente Supabase conectado.");
      } else {
        setSupabaseAuthenticatedClient(null); // Si no esta autenticado, no hay cliente autenticado
        setUser(null); // Limpiar usuario también
        // console.log("AuthContext: Cliente Supabase desconectado.");
      }
    } else {
      setSupabaseAuthenticatedClient(null); // Mientras Clerk carga, no hay cliente autenticado
      // console.log("AuthContext: Cliente Supabase desconectado (Clerk no cargado).");
    }
  }, [isClerkLoaded, isAuthenticated]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !supabaseAuthenticatedClient) return;

      setIsLoading(true)
      setError(null)

      if (!clerkUser || !clerkUser.id) {
        console.warn('AuthContext: Usuario de Clerk no autenticado o ID no disponible.');
        setUser(null) // Usar user
        setError('Usuario no autenticado o ID no disponible.');
        setIsLoading(false)
        return
      }

      try {
        // Usar una consulta directa sin depender de RLS/JWT
        const { data: existingUser, error: supabaseFetchError } = await supabaseAuthenticatedClient
          .from('usuarios')
          .select('id, email, nombre, apellido, telefono, direccion, rol, created_at')
          .eq('id', clerkUser.id)
          .single()

        if (supabaseFetchError && supabaseFetchError.code === 'PGRST116') {
          // Usuario no existe, crearlo
          const newUser: Omit<Usuario, 'created_at'> = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            nombre: clerkUser.firstName || '',
            apellido: clerkUser.lastName || '',
            telefono: clerkUser.phoneNumbers?.[0]?.phoneNumber || undefined,
            direccion: undefined,
            rol: 'cliente',
          }

          const { data: createdUser, error: supabaseCreateError } = await supabaseAuthenticatedClient
            .from('usuarios')
            .insert([newUser])
            .select('id, email, nombre, apellido, telefono, direccion, rol, created_at')
            .single()

          if (supabaseCreateError) {
            console.error('Error creating user:', supabaseCreateError)
            setError('Error al crear el perfil de usuario. Intentalo mas tarde.')
            return
          }

          setUser(createdUser)
          console.log('AuthContext: Usuario creado exitosamente en Supabase.')
        } else if (supabaseFetchError) {
          console.error('Error fetching user:', supabaseFetchError)
          
          // Si hay un error de autenticación, intentar crear el usuario de todas formas
          if (supabaseFetchError.code === '401' || supabaseFetchError.message?.includes('JWT')) {
            console.log('AuthContext: Error de JWT, intentando crear usuario directamente...')
            
            const newUser: Omit<Usuario, 'created_at'> = {
              id: clerkUser.id,
              email: clerkUser.emailAddresses[0]?.emailAddress || '',
              nombre: clerkUser.firstName || '',
              apellido: clerkUser.lastName || '',
              telefono: clerkUser.phoneNumbers?.[0]?.phoneNumber || undefined,
              direccion: undefined,
              rol: 'cliente',
            }

            const { data: createdUser, error: createError } = await supabaseAuthenticatedClient
              .from('usuarios')
              .upsert([newUser], { onConflict: 'id' })
              .select('id, email, nombre, apellido, telefono, direccion, rol, created_at')
              .single()

            if (!createError && createdUser) {
              setUser(createdUser)
              console.log('AuthContext: Usuario creado/actualizado exitosamente saltando JWT.')
              return
            }
          }
          
          setError('Error al cargar la informacion del usuario. La app funcionará con datos limitados.')
          
          // Crear un usuario temporal para que la app funcione
          setUser({
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            nombre: clerkUser.firstName || '',
            apellido: clerkUser.lastName || '',
            telefono: clerkUser.phoneNumbers?.[0]?.phoneNumber || undefined,
            direccion: undefined,
            rol: 'cliente',
            created_at: new Date().toISOString()
          })
          
          return
        } else {
          setUser(existingUser)
          // console.log('AuthContext: Usuario cargado exitosamente desde Supabase.')
        }
      } catch (err) {
        console.error('Error inesperado en fetchUser:', err)
        setError('Ocurrio un error inesperado al gestionar tu perfil.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [clerkUser, isLoaded, supabaseAuthenticatedClient])

  const updateUser = async (userData: Partial<Usuario>) => {
    if (!user || !supabaseAuthenticatedClient) return // Usar user

    try {
      const { data, error: supabaseUpdateError } = await supabaseAuthenticatedClient
        .from('usuarios')
        .update(userData)
        .eq('id', user.id) // Usar user.id
        .select()
        .single()

      if (supabaseUpdateError) {
        console.error('Error updating user:', supabaseUpdateError)
        return
      }

      setUser(data) // Usar user
    } catch (err) {
      console.error('Error inesperado en updateUser:', err)
    }
  }

  const isAdmin = user?.rol === 'admin' // Usar user

  const logout = async () => {
    // Clerk maneja el logout automaticamente, pero tambien necesitamos cerrar la sesion de Supabase
    try {
      await globalSupabase.auth.signOut(); // Usar la instancia global para cerrar sesion
    } catch (err) {
      console.error('AuthContext: Error al cerrar la sesion de Supabase durante el logout:', err);
    }
    setUser(null)
    setError(null)
    setSupabaseAuthenticatedClient(null)
  }

  const value: AuthContextType = {
    clerkUser,
    user, // Exponer user
    isAdmin,
    isLoading,
    isAuthenticated,
    error,
    updateUser,
    logout,
    supabaseAuthenticatedClient,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


