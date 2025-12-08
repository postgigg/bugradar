import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[Auth Callback] Request URL:', request.url)
  console.log('[Auth Callback] Origin:', origin)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')
  console.log('[Auth Callback] Error param:', error_param)
  console.log('[Auth Callback] Error description:', error_description)

  // If there's an error from the OAuth provider
  if (error_param) {
    console.log('[Auth Callback] OAuth error:', error_param, error_description)
    return NextResponse.redirect(`${origin}/login?error=${error_param}&message=${encodeURIComponent(error_description || '')}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[Auth Callback] Exchange result - error:', error?.message)

    if (!error) {
      // Check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser()

      console.log('[Auth Callback] User:', user?.id)

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        console.log('[Auth Callback] Profile:', profile)

        const redirectTo = profile?.onboarding_completed ? next : '/onboarding'
        console.log('[Auth Callback] Redirecting to:', `${origin}${redirectTo}`)
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    } else {
      console.log('[Auth Callback] Exchange failed:', error.message)
    }
  }

  // Return to login with error
  console.log('[Auth Callback] Falling through to error redirect')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
