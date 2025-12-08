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
    const email = searchParams.get('email')

    if (secret !== 'bugradar-setup-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Find the user
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (!users) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check existing memberships
    const { data: memberships } = await supabaseAdmin
      .from('organization_members')
      .select('*, organizations(*)')
      .eq('user_id', users.id)

    // Check organizations they created (by looking at recent orgs)
    const { data: orgs } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // If user has no memberships, find their most recent org and create membership
    if (!memberships || memberships.length === 0) {
      // Look for org with matching slug pattern or recent creation
      const { data: recentOrg } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (recentOrg) {
        // Create membership for them
        const { error: memberError } = await supabaseAdmin
          .from('organization_members')
          .insert({
            organization_id: recentOrg.id,
            user_id: users.id,
            role: 'owner',
          })

        if (memberError) {
          return NextResponse.json({
            error: 'Failed to create membership',
            details: memberError.message,
            user: users,
            org: recentOrg
          }, { status: 500 })
        }

        // Also ensure subscription exists
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('organization_id', recentOrg.id)
          .single()

        if (!existingSub) {
          await supabaseAdmin
            .from('subscriptions')
            .insert({
              organization_id: recentOrg.id,
              plan_tier: 'free',
              status: 'active',
            })
        }

        return NextResponse.json({
          success: true,
          message: 'Created membership and subscription',
          user: users,
          org: recentOrg
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User membership status',
      user: users,
      memberships: memberships,
      recentOrgs: orgs
    })
  } catch (error) {
    console.error('Fix org membership error:', error)
    return NextResponse.json({ error: 'Failed to fix org membership' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const email = searchParams.get('email')

    if (secret !== 'bugradar-setup-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    if (email) {
      // Get specific user info
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const { data: memberships } = await supabaseAdmin
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', user.id)

      return NextResponse.json({ user, memberships })
    }

    // Get all users without org memberships
    const { data: allUsers } = await supabaseAdmin
      .from('users')
      .select('id, email')

    const usersWithoutOrgs = []
    for (const user of allUsers || []) {
      const { data: membership } = await supabaseAdmin
        .from('organization_members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        usersWithoutOrgs.push(user)
      }
    }

    return NextResponse.json({
      totalUsers: allUsers?.length || 0,
      usersWithoutOrgs
    })
  } catch (error) {
    console.error('Check org membership error:', error)
    return NextResponse.json({ error: 'Failed to check org membership' }, { status: 500 })
  }
}
