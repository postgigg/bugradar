import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    if (type === 'supabase') {
      return await validateSupabase(body.url, body.anonKey)
    }

    if (type === 'anthropic') {
      return await validateAnthropic(body.apiKey)
    }

    if (type === 'resend') {
      return await validateResend(body.apiKey)
    }

    return NextResponse.json({ valid: false, message: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('[Validate Keys] Error:', error)
    return NextResponse.json({ valid: false, message: 'Validation failed' }, { status: 500 })
  }
}

async function validateSupabase(url: string, anonKey: string) {
  try {
    // Create a temporary client with the provided credentials
    const supabase = createClient(url, anonKey)

    // Try to fetch something simple to verify connection
    const { error } = await supabase.from('_test_connection_').select('*').limit(1)

    // If we get a "relation does not exist" error, that's actually good - it means we connected!
    // If we get an auth error, the keys are invalid
    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ valid: true, message: 'Connected successfully' })
      }
      if (error.message.includes('Invalid API key') || error.code === 'PGRST301') {
        return NextResponse.json({ valid: false, message: 'Invalid API key' })
      }
      // Connection worked even if table doesn't exist
      return NextResponse.json({ valid: true, message: 'Connected successfully' })
    }

    return NextResponse.json({ valid: true, message: 'Connected successfully' })
  } catch (err: any) {
    if (err.message?.includes('fetch failed')) {
      return NextResponse.json({ valid: false, message: 'Could not connect to URL' })
    }
    return NextResponse.json({ valid: false, message: 'Connection failed' })
  }
}

async function validateAnthropic(apiKey: string) {
  try {
    // Make a simple request to Anthropic API to validate the key
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    })

    if (response.ok) {
      return NextResponse.json({ valid: true, message: 'API key valid' })
    }

    const data = await response.json()
    if (data.error?.type === 'authentication_error') {
      return NextResponse.json({ valid: false, message: 'Invalid API key' })
    }
    if (data.error?.type === 'invalid_request_error') {
      // Key is valid but request was malformed - that's ok for validation
      return NextResponse.json({ valid: true, message: 'API key valid' })
    }

    return NextResponse.json({ valid: false, message: data.error?.message || 'Validation failed' })
  } catch (err) {
    return NextResponse.json({ valid: false, message: 'Could not connect to Anthropic' })
  }
}

async function validateResend(apiKey: string) {
  try {
    // Use Resend's domains endpoint to validate key
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return NextResponse.json({ valid: true, message: 'API key valid' })
    }

    if (response.status === 401) {
      return NextResponse.json({ valid: false, message: 'Invalid API key' })
    }

    return NextResponse.json({ valid: false, message: 'Validation failed' })
  } catch (err) {
    return NextResponse.json({ valid: false, message: 'Could not connect to Resend' })
  }
}
