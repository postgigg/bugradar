import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Always use production domain for redirects
const getBaseUrl = (requestUrl: string) => {
  const url = new URL(requestUrl)
  // In production, always redirect to bugradar.io regardless of internal Netlify URL
  if (url.hostname.includes('netlify.app') || url.hostname === 'bugradar.io') {
    return 'https://bugradar.io'
  }
  // Local development
  return url.origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const baseUrl = getBaseUrl(request.url)

  console.log('[Auth Callback] Request URL:', request.url)
  console.log('[Auth Callback] Base URL:', baseUrl)
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
        console.log('[Auth Callback] Success, redirecting to:', `${baseUrl}${redirectTo}`)
        return NextResponse.redirect(`${baseUrl}${redirectTo}`)
      }
    }
  }

  // Return to login with error
  console.log('[Auth Callback] Failed, redirecting to login')
  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
}
