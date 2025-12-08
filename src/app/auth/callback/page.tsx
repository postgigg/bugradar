'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      // Get error from URL params (if any)
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        console.error('[Auth Callback] OAuth error:', error, errorDescription)
        setStatus('Authentication failed')
        router.push(`/login?error=${error}`)
        return
      }

      // Get code from URL params (PKCE flow)
      const code = searchParams.get('code')

      console.log('[Auth Callback] Code present:', !!code)
      console.log('[Auth Callback] Hash present:', !!window.location.hash)

      if (code) {
        // Exchange the code for a session (PKCE flow)
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('[Auth Callback] Exchange error:', exchangeError)
          setStatus('Authentication failed')
          router.push(`/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`)
          return
        }
      }

      // Check for hash tokens (implicit flow) or existing session
      // Give Supabase a moment to process
      await new Promise(resolve => setTimeout(resolve, 100))

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      console.log('[Auth Callback] Session:', !!session, 'Error:', sessionError?.message)

      if (sessionError) {
        console.error('[Auth Callback] Session error:', sessionError)
        setStatus('Authentication failed')
        router.push('/login?error=session_error')
        return
      }

      if (session) {
        console.log('[Auth Callback] Success! User:', session.user.id)

        // Check if user needs onboarding
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()

        const redirectTo = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
        setStatus('Success! Redirecting...')
        router.push(redirectTo)
      } else {
        console.log('[Auth Callback] No session found')
        setStatus('No session found')
        router.push('/login?error=no_session')
      }
    }

    handleAuth()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500 mx-auto mb-4"></div>
        <p className="text-slate-600">{status}</p>
      </div>
    </div>
  )
}
