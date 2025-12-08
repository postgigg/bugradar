'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      // Check if there's a hash with tokens (implicit flow)
      const hash = window.location.hash
      console.log('[Auth Callback] Hash present:', !!hash)

      if (hash) {
        // Parse the hash - Supabase handles this automatically when we call getSession
        // after the hash is present
        const { data: { session }, error: hashError } = await supabase.auth.getSession()

        if (hashError) {
          console.error('[Auth Callback] Hash error:', hashError)
          setError(hashError.message)
          setTimeout(() => router.push('/login?error=auth_callback_error'), 2000)
          return
        }

        if (session) {
          console.log('[Auth Callback] Session from hash, user:', session.user.email)
          await redirectUser(supabase, session.user.id)
          return
        }
      }

      // Check for code parameter (PKCE flow fallback)
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorParam = params.get('error')
      const errorDescription = params.get('error_description')

      if (errorParam) {
        console.error('[Auth Callback] OAuth error:', errorParam, errorDescription)
        setError(errorDescription || errorParam)
        setTimeout(() => router.push('/login?error=auth_callback_error'), 2000)
        return
      }

      if (code) {
        console.log('[Auth Callback] Code found, exchanging...')
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('[Auth Callback] Exchange error:', exchangeError)
          setError(exchangeError.message)
          setTimeout(() => router.push('/login?error=exchange_failed'), 2000)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await redirectUser(supabase, session.user.id)
          return
        }
      }

      // No hash or code, check if we have an existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await redirectUser(supabase, session.user.id)
        return
      }

      // No session found
      console.error('[Auth Callback] No session found')
      router.push('/login?error=auth_callback_error')
    }

    const redirectUser = async (supabase: ReturnType<typeof createClient>, userId: string) => {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', userId)
        .single()

      const redirectTo = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
      console.log('[Auth Callback] Redirecting to:', redirectTo)
      router.push(redirectTo)
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Authentication error</p>
          <p className="text-sm text-slate-500">{error}</p>
          <p className="text-sm text-slate-400 mt-2">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Completing sign in...</p>
      </div>
    </div>
  )
}
