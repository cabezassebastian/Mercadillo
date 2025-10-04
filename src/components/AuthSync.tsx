import { useEffect, useRef } from 'react'
import { useSession, useUser } from '@clerk/clerk-react'
import { supabase } from '@/lib/supabaseClient'
import { createUserProfile } from '@/lib/userProfile'

// 🎯 Simple global storage for the Clerk token
let cachedToken: string | null = null
let tokenPromise: Promise<string | null> | null = null

// 🎯 Track if we've already created the user profile to avoid duplicates
const processedUsers = new Set<string>()

const AuthSync = () => {
	const { session, isLoaded } = useSession()
	const { user } = useUser()
	const hasProcessedUser = useRef(false)

	useEffect(() => {
		if (!isLoaded) return

		// 💾 Expose a getter that returns the cached token OR fetches it
		;(window as any).__getClerkToken = async () => {
			// If we already have a token, return it immediately
			if (cachedToken) return cachedToken
			
			// If already fetching, wait for that promise
			if (tokenPromise) return tokenPromise
			
			// Otherwise, fetch the token
			if (session) {
				tokenPromise = session.getToken({ template: 'supabase' }).then(token => {
					cachedToken = token
					tokenPromise = null
					return token
				}).catch(() => {
					tokenPromise = null
					return null
				})
				return tokenPromise
			}
			
			return null
		}

		const sync = async () => {
			if (session && user) {
				try {
					const token = await session.getToken({ template: 'supabase' })
					if (token) {
						// 💾 Cache the token
						cachedToken = token
						
						// Try to set session on supabase client
						try {
							await supabase.auth.setSession({ access_token: token, refresh_token: '' })
						} catch (e) {
							// If setSession fails, that's OK - we'll use the token directly
						}
						
						// 🎉 Check if user exists in database, if not create profile and send welcome email
						if (!hasProcessedUser.current && !processedUsers.has(user.id)) {
							hasProcessedUser.current = true
							processedUsers.add(user.id)
							
							try {
								// Check if user already exists in database
								const { data: existingUser } = await supabase
									.from('usuarios')
									.select('usuario_id')
									.eq('usuario_id', user.id)
									.single()
								
								// If user doesn't exist, create profile and send welcome email
								if (!existingUser) {
									console.log('📧 New user detected, creating profile and sending welcome email...')
									
									const result = await createUserProfile(user.id, {
										email: user.primaryEmailAddress?.emailAddress || '',
										nombre: user.firstName || 'Usuario',
										apellido: user.lastName || '',
										telefono: user.primaryPhoneNumber?.phoneNumber || undefined
									})
									
									if (result.success) {
										console.log('✅ User profile created and welcome email sent!')
									} else {
										console.error('❌ Error creating user profile:', result.error)
									}
								}
							} catch (error) {
								console.error('Error checking/creating user profile:', error)
							}
						}
						
						// Dispatch event so waiting code knows token is ready
						window.dispatchEvent(new Event('supabase-session-ready'))
						return
					}
				} catch (err) {
					console.error('AuthSync: error getting Clerk token', err)
				}
			} else {
				// No clerk session: clear cache
				cachedToken = null
				hasProcessedUser.current = false
				try {
					const { data } = await supabase.auth.getSession()
					if (data?.session) {
						await supabase.auth.signOut()
					}
				} catch (e) {
					// ignore
				}
			}
		}

		sync()
	}, [session, user, isLoaded])

	return null
}

export default AuthSync