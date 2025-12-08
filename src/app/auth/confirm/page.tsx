'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      // Check if we have a session from the hash tokens (implicit flow)
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('[Auth Confirm] Error:', error)
        setStatus('Authentication failed')
        setTimeout(() => router.push('/login?error=auth_failed'), 1500)
        return
      }

      if (session) {
        console.log('[Auth Confirm] Session found, user:', session.user.id)

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
        console.log('[Auth Confirm] No session found')
        setStatus('No session found')
        setTimeout(() => router.push('/login?error=no_session'), 1500)
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
