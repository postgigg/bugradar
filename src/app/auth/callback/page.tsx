'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      // With implicit flow, Supabase automatically detects tokens in the URL hash
      // and sets up the session when we call getSession
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('[Auth Callback] Error:', error)
        router.push('/login?error=auth_callback_error')
        return
      }

      if (session) {
        console.log('[Auth Callback] Session found, user:', session.user.email)

        // Check onboarding status
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()

        const redirectTo = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
        console.log('[Auth Callback] Redirecting to:', redirectTo)
        router.push(redirectTo)
        return
      }

      // No session found - redirect to login
      console.error('[Auth Callback] No session found')
      router.push('/login?error=auth_callback_error')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Completing sign in...</p>
      </div>
    </div>
  )
}
