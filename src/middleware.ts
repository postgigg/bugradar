import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // For self-hosted: no authentication required
  // Just pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
  ],
}
