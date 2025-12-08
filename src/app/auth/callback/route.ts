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
  console.log('[Auth Callback] Hostname:', hostname)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')

  // Use production domain for all redirects in production
  const redirectBase = hostname === 'localhost' ? origin : PRODUCTION_DOMAIN

  // For implicit flow, tokens come in the URL hash (handled client-side)
  // This route handles the code flow as fallback

  // If there's an error from the OAuth provider
  if (error_param) {
    console.log('[Auth Callback] OAuth error:', error_param, error_description)
    return NextResponse.redirect(`${redirectBase}/login?error=${error_param}&message=${encodeURIComponent(error_description || '')}`)
  }

  // If we have a code (PKCE flow), exchange it
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[Auth Callback] Exchange result - error:', error?.message)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[Auth Callback] User:', user?.id)

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        const redirectTo = profile?.onboarding_completed ? next : '/onboarding'
        return NextResponse.redirect(`${redirectBase}${redirectTo}`)
      }
    }
  }

  // For implicit flow, redirect to a client-side page that handles the hash tokens
  // The hash fragment is not sent to the server, so we redirect to handle it client-side
  return NextResponse.redirect(`${redirectBase}/auth/confirm`)
}
