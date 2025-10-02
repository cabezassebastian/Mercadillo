import { useEffect } from 'react'
import { useSession, useUser } from '@clerk/clerk-react'
import { supabase } from '@/lib/supabaseClient'

// 🎯 Simple global storage for the Clerk token
let cachedToken: string | null = null
let tokenPromise: Promise<string | null> | null = null

const AuthSync = () => {
	const { session, isLoaded } = useSession()
	const { user } = useUser()

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
							console.log('AuthSync: setSession failed (expected), will use token directly')
						}
						
						console.log('✅ AuthSync: Clerk token cached and ready')
						// Dispatch event so waiting code knows token is ready
						window.dispatchEvent(new Event('supabase-session-ready'))
						return
					}
					console.warn('AuthSync: Clerk getToken returned null')
				} catch (err) {
					console.error('AuthSync: error getting Clerk token', err)
				}
			} else {
				// No clerk session: clear cache
				cachedToken = null
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