import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useUser, useSession, useAuth as useClerkAuthHook } from '@clerk/clerk-react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/config/env'
import { supabase, Usuario } from '@/lib/supabase'
import { UserResource } from '@clerk/types';

interface AuthContextType {
  clerkUser: UserResource | null | undefined;
  user: Usuario | null; // Renombrado de supabaseUser a user
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean | undefined;
  error: string | null;
  updateUser: (userData: Partial<Usuario>) => Promise<void>;
  logout: () => Promise<void>;
  supabaseAuthenticatedClient: SupabaseClient | null;
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
  const { session, isLoaded: isClerkLoaded, isSignedIn: isAuthenticated } = useSession()
  const { getToken } = useClerkAuthHook();

  const [supabaseAuthenticatedClient, setSupabaseAuthenticatedClient] = useState<SupabaseClient | null>(null);

  const getClerkTokenForSupabase = useCallback(async (): Promise<string | null> => {
    if (!session) {
      console.warn('AuthContext: No hay sesion de Clerk para obtener el token de Supabase.');
      return null;
    }
    try {
      const token = await getToken({ template: "supabase" });
      return token;
    } catch (err) {
      console.error('AuthContext: Error al obtener el token de Clerk para Supabase:', err);
      return null;
    }
  }, [session, getToken]);

  useEffect(() => {
    const initializeSupabaseClient = async () => {
      if (!isClerkLoaded) return;

      if (isAuthenticated && session) {
        const accessToken = await getClerkTokenForSupabase();

        if (accessToken) {
          const authenticatedSupabase = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_ANON_KEY,
            {
              global: {
                headers: { Authorization: `Bearer ${accessToken}` },
              },
            }
          );
          setSupabaseAuthenticatedClient(authenticatedSupabase);
        } else {
          console.warn('AuthContext: No se pudo obtener el accessToken de Clerk para Supabase. Cliente Supabase autenticado sera null.');
          setSupabaseAuthenticatedClient(null);
        }
      } else {
        setSupabaseAuthenticatedClient(null);
      }
    };

    initializeSupabaseClient();
  }, [isClerkLoaded, isAuthenticated, session, getClerkTokenForSupabase, env.SUPABASE_URL, env.SUPABASE_ANON_KEY]);

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
        const { data: existingUser, error: supabaseFetchError } = await supabaseAuthenticatedClient
          .from('usuarios')
          .select('id, email, nombre, apellido, rol, created_at')
          .eq('id', clerkUser.id)
          .single()

        if (supabaseFetchError && supabaseFetchError.code === 'PGRST116') {
          const newUser: Omit<Usuario, 'created_at'> = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            nombre: clerkUser.firstName || '',
            apellido: clerkUser.lastName || '',
            rol: 'cliente',
          }

          const { data: createdUser, error: supabaseCreateError } = await supabaseAuthenticatedClient
            .from('usuarios')
            .insert([newUser])
            .select('id, email, nombre, apellido, rol, created_at')
            .single()

          if (supabaseCreateError) {
            console.error('Error creating user:', supabaseCreateError)
            setError('Error al crear el perfil de usuario. Intentalo mas tarde.')
            return
          }

          setUser(createdUser) // Usar user
        } else if (supabaseFetchError) {
          console.error('Error fetching user:', supabaseFetchError)
          if (supabaseFetchError.code === '401') {
            setError('No autorizado. Por favor, asegurate de haber iniciado sesion y tener los permisos correctos.')
          } else if (supabaseFetchError.code === '406') {
            setError('Solicitud no aceptable. Verifica la configuracion de la base de datos o los datos enviados.')
          } else {
            setError('Error al cargar la informacion del usuario. Intentalo mas tarde.')
          }
          return
        } else {
          setUser(existingUser) // Usar user
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
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        if (signOutError.message.includes('Auth session missing')) {
          console.warn('AuthContext: Intento de cerrar sesion sin sesion activa en Supabase.')
        } else {
          console.error('AuthContext: Error al cerrar sesion en Supabase:', signOutError)
          setError('Error al cerrar sesion. Intentalo de nuevo.')
        }
        return
      }
      setUser(null) // Usar user
      setError(null)
    } catch (err) {
      console.error('AuthContext: Error inesperado durante el logout:', err)
      setError('Ocurrio un error inesperado al intentar cerrar sesion.')
    }
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


