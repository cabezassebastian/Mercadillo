import { useEffect } from 'react'
import { useSession, useUser } from '@clerk/clerk-react'
import { supabase } from '@/lib/supabaseClient'

const AuthSync = () => {
	const { session, isLoaded } = useSession()
	const { user } = useUser()

	useEffect(() => {
		if (!isLoaded) return

		// Expose a safe async getter so other code can try Clerk token if needed
		try {
			;(window as any).__getClerkToken = async () => {
				try {
					return session ? await session.getToken({ template: 'supabase' }) : null
				} catch (e) {
					return null
				}
			}
		} catch (e) {
			// ignore
		}

		const sync = async () => {
			if (session && user) {
				try {
					const token = await session.getToken({ template: 'supabase' })
					if (token) {
						// Set session on the shared supabase client
						await supabase.auth.setSession({ access_token: token, refresh_token: '' })
						
						// Verify the session was actually set
						const { data: verifySession } = await supabase.auth.getSession()
						if (verifySession?.session?.access_token) {
							console.log('AuthSync: Supabase session set and verified from Clerk token')
							// Small delay to ensure listeners are ready, then dispatch event
							setTimeout(() => {
								try { 
									window.dispatchEvent(new Event('supabase-session-ready'))
									console.log('AuthSync: Dispatched supabase-session-ready event')
								} catch (e) { /* ignore */ }
							}, 50)
						} else {
							console.warn('AuthSync: Session set but verification failed')
						}
						return
					}
					console.warn('AuthSync: Clerk getToken returned null')
				} catch (err) {
					console.error('AuthSync: error getting Clerk token or setting supabase session', err)
				}
			} else {
				// No clerk session: ensure supabase signed out
				try {
					const { data } = await supabase.auth.getSession()
					if (data?.session) {
						await supabase.auth.signOut()
						console.log('AuthSync: Supabase signed out because no Clerk session')
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