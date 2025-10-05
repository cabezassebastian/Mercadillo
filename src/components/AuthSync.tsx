import { useEffect, useRef } from 'react'
import { useSession, useUser } from '@clerk/clerk-react'
import { supabase } from '@/lib/supabaseClient'
import { createUserProfile } from '@/lib/userProfile'

// 🎯 Simple global storage for the Clerk token
let cachedToken: string | null = null
let tokenPromise: Promise<string | null> | null = null

// 🎯 Track if we've already created the user profile to avoid duplicates
const processedUsers = new Set<string>()
const lastSyncedData = new Map<string, string>() // Track last synced data to detect changes

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
						
						// 🎉 Check and sync user profile
						if (!hasProcessedUser.current && !processedUsers.has(user.id)) {
							hasProcessedUser.current = true
							processedUsers.add(user.id)
						}
						
						try {
							// Always check user data for changes
							const clerkFirstName = user.firstName || ''
							const clerkLastName = user.lastName || ''
							const clerkEmail = user.primaryEmailAddress?.emailAddress || ''
							const dataKey = `${clerkFirstName}|${clerkLastName}|${clerkEmail}`
							
							// Check if we've already synced this exact data
							const lastSynced = lastSyncedData.get(user.id)
							if (lastSynced === dataKey) {
								// Data hasn't changed since last sync, skip
								return
							}
							
							// Check if user exists in database
							const { data: existingUser } = await supabase
								.from('usuarios')
								.select('id, nombre, apellido, email')
								.eq('id', user.id)
								.single()
							
							// If user doesn't exist, create profile and send welcome email
							if (!existingUser) {
								console.log('📧 New user detected, creating profile and sending welcome email...')
								
								const result = await createUserProfile(user.id, {
									email: clerkEmail,
									nombre: clerkFirstName || 'Usuario',
									apellido: clerkLastName,
									telefono: user.primaryPhoneNumber?.phoneNumber || undefined
								})
								
								if (result.success) {
									console.log('✅ User profile created and welcome email sent!')
									lastSyncedData.set(user.id, dataKey)
									window.dispatchEvent(new Event('user-profile-created'))
								} else {
									console.error('❌ Error creating user profile:', result.error)
								}
							} else {
								// User exists - check if profile needs updating
								const needsUpdate = 
									existingUser.nombre !== clerkFirstName ||
									existingUser.apellido !== clerkLastName ||
									existingUser.email !== clerkEmail
								
								if (needsUpdate) {
									console.log('🔄 User profile changed, syncing to Supabase...')
									
									const { error: updateError } = await supabase
										.from('usuarios')
										.update({
											nombre: clerkFirstName,
											apellido: clerkLastName,
											email: clerkEmail,
											telefono: user.primaryPhoneNumber?.phoneNumber || null
										})
										.eq('id', user.id)
									
									if (updateError) {
										console.error('❌ Error updating user profile:', updateError)
									} else {
										console.log('✅ User profile synced!')
										lastSyncedData.set(user.id, dataKey)
										window.dispatchEvent(new Event('user-profile-updated'))
									}
								} else {
									// Data matches DB, just update cache to prevent re-checking
									lastSyncedData.set(user.id, dataKey)
								}
							}
						} catch (error) {
							console.error('Error syncing user profile:', error)
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