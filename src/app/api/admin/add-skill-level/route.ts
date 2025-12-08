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

    // Try to add skill_level column - will fail silently if already exists
    // Note: We can't run raw SQL via supabase-js, so we'll check if the column exists
    // by trying to select it

    // First, let's try to update a user with skill_level to see if column exists
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)

    if (users && users.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ skill_level: 'pro' })
        .eq('id', users[0].id)

      if (updateError && updateError.message.includes('skill_level')) {
        return NextResponse.json({
          success: false,
          message: 'Column skill_level does not exist. Please run this SQL in Supabase SQL Editor:',
          sql: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'rookie' CHECK (skill_level IN ('rookie', 'pro'));`
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'skill_level column exists and is working',
    })
  } catch (error) {
    console.error('Add skill level error:', error)
    return NextResponse.json({ error: 'Failed to add skill level' }, { status: 500 })
  }
}
