import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Production domain - all auth should happen here
const PRODUCTION_DOMAIN = 'https://bugradar.io'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams, origin, hostname } = requestUrl
  const code = searchParams.get('code')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[Auth Callback] Request URL:', request.url)
  console.log('[Auth Callback] Origin:', origin)
  console.log('[Auth Callback] Hostname:', hostname)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')

  // If we're on a Netlify URL but have a code, redirect to production domain with the code
  // This ensures the PKCE exchange happens on the same domain as the original request
  if (hostname.includes('netlify.app') && code) {
    const productionUrl = new URL('/auth/callback', PRODUCTION_DOMAIN)
    productionUrl.searchParams.set('code', code)
    if (next !== '/dashboard') {
      productionUrl.searchParams.set('next', next)
    }
    console.log('[Auth Callback] Redirecting to production domain:', productionUrl.toString())
    return NextResponse.redirect(productionUrl.toString())
  }

  // Use production domain for all redirects in production
  const redirectBase = hostname === 'localhost' ? origin : PRODUCTION_DOMAIN

  // If there's an error from the OAuth provider
  if (error_param) {
    console.log('[Auth Callback] OAuth error:', error_param, error_description)
    return NextResponse.redirect(`${redirectBase}/login?error=${error_param}&message=${encodeURIComponent(error_description || '')}`)
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
        console.log('[Auth Callback] Redirecting to:', `${redirectBase}${redirectTo}`)
        return NextResponse.redirect(`${redirectBase}${redirectTo}`)
      }
    } else {
      console.log('[Auth Callback] Exchange failed:', error.message)
    }
  }

  // Return to login with error
  console.log('[Auth Callback] Falling through to error redirect')
  return NextResponse.redirect(`${redirectBase}/login?error=auth_callback_error`)
}
