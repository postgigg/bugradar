import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Always use production domain for redirects
const getBaseUrl = (requestUrl: string) => {
  const url = new URL(requestUrl)
  if (url.hostname.includes('netlify.app') || url.hostname === 'bugradar.io') {
    return 'https://bugradar.io'
  }
  return url.origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const baseUrl = getBaseUrl(request.url)
  const cookieStore = await cookies()

  // Log all available cookies
  const allCookies = cookieStore.getAll()
  console.log('[Auth Callback] Request URL:', request.url)
  console.log('[Auth Callback] Base URL:', baseUrl)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')
  console.log('[Auth Callback] Available cookies:', allCookies.map(c => c.name).join(', ') || 'none')

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[Auth Callback] Exchange error:', error?.message || 'none')

    if (!error) {
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
    } else {
      console.log('[Auth Callback] Exchange failed:', error.message)
      return NextResponse.redirect(`${baseUrl}/login?error=exchange_failed&message=${encodeURIComponent(error.message)}`)
    }
  }

  console.log('[Auth Callback] No code, redirecting to login')
  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
}
