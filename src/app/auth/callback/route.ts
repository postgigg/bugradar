import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[Auth Callback] Request URL:', request.url)
  console.log('[Auth Callback] Origin:', origin)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[Auth Callback] Exchange error:', error?.message || 'none')

    if (!error) {
      // Check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        const redirectTo = profile?.onboarding_completed ? next : '/onboarding'
        console.log('[Auth Callback] Success, redirecting to:', redirectTo)
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  // Return to login with error
  console.log('[Auth Callback] Failed, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
