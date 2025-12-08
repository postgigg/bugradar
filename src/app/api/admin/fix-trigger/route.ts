import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Supabase credentials not configured')
    }
    _supabaseAdmin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return _supabaseAdmin
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== 'bugradar-setup-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Insert missing user records for any existing auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({ error: 'Failed to list auth users', details: authError.message }, { status: 500 })
    }

    const results = []

    for (const authUser of authUsers.users) {
      // Check if user exists in public.users
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (!existingUser) {
        // Insert the user
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
          })

        if (insertError) {
          results.push({ email: authUser.email, status: 'error', error: insertError.message })
        } else {
          results.push({ email: authUser.email, status: 'created' })
        }
      } else {
        results.push({ email: authUser.email, status: 'already_exists' })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User sync complete',
      totalAuthUsers: authUsers.users.length,
      results,
    })
  } catch (error) {
    console.error('Fix trigger error:', error)
    return NextResponse.json({ error: 'Failed to fix trigger' }, { status: 500 })
  }
}
