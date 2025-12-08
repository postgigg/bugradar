'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuth = async () => {
      // Get params directly from window.location to avoid Suspense issues
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')
      const errorDescription = url.searchParams.get('error_description')

      console.log('[Auth Callback] URL:', window.location.href)
      console.log('[Auth Callback] Code:', code ? code.substring(0, 20) + '...' : 'none')
      console.log('[Auth Callback] Error:', error)

      const supabase = createClient()

      if (error) {
        console.error('[Auth Callback] OAuth error:', error, errorDescription)
        setStatus('Authentication failed')
        router.push(`/login?error=${error}`)
        return
      }

      if (code) {
        console.log('[Auth Callback] Exchanging code for session...')
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('[Auth Callback] Exchange error:', exchangeError.message)
          setStatus('Authentication failed')
          router.push(`/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`)
          return
        }

        console.log('[Auth Callback] Exchange successful, session:', !!data.session)

        if (data.session) {
          // Check if user needs onboarding
          const { data: profile } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', data.session.user.id)
            .single()

          const redirectTo = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
          setStatus('Success! Redirecting...')
          router.push(redirectTo)
          return
        }
      }

      // No code - check for existing session
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        console.log('[Auth Callback] Found existing session')
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()

        const redirectTo = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
        router.push(redirectTo)
      } else {
        console.log('[Auth Callback] No session found')
        setStatus('No session found')
        router.push('/login?error=no_session')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500 mx-auto mb-4"></div>
        <p className="text-slate-600">{status}</p>
      </div>
    </div>
  )
}
