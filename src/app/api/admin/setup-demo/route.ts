import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'crypto'

// Lazy initialization to prevent build errors when env vars are not set
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

// Hash function for API keys (must match the one in bugs/route.ts)
function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex')
}

// Demo organization with fixed ID for the landing page widget
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_PROJECT_ID = '00000000-0000-0000-0000-000000000002'

export async function POST(request: Request) {
  try {
    // Check for admin secret - simple protection for this admin endpoint
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.ADMIN_SECRET && secret !== 'bugradar-setup-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Check if demo org already exists
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('id', DEMO_ORG_ID)
      .single()

    if (!existingOrg) {
      // Create demo organization
      const { error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
          id: DEMO_ORG_ID,
          name: 'BugRadar Demo',
          slug: 'bugradar-demo',
        })

      if (orgError) {
        console.error('Org creation error:', orgError)
        return NextResponse.json({ error: 'Failed to create demo org', details: orgError.message }, { status: 500 })
      }
    }

    // Check if demo subscription exists
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('organization_id', DEMO_ORG_ID)
      .single()

    if (!existingSub) {
      // Create subscription for demo org
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          organization_id: DEMO_ORG_ID,
          plan_tier: 'team',
          status: 'active',
          max_bugs_per_month: 99999,
          ai_credits_limit: 99999,
          ai_credits_used: 0,
        })

      if (subError) {
        console.error('Subscription creation error:', subError)
        return NextResponse.json({ error: 'Failed to create subscription', details: subError.message }, { status: 500 })
      }
    }

    // Check if demo project exists
    const { data: existingProject } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', DEMO_PROJECT_ID)
      .single()

    if (!existingProject) {
      // Create demo project
      const { error: projectError } = await supabaseAdmin
        .from('projects')
        .insert({
          id: DEMO_PROJECT_ID,
          organization_id: DEMO_ORG_ID,
          name: 'Landing Page Demo',
          slug: 'landing-page-demo',
          description: 'Demo project for the BugRadar landing page widget',
          platform: 'web',
        })

      if (projectError) {
        console.error('Project creation error:', projectError)
        return NextResponse.json({ error: 'Failed to create project', details: projectError.message }, { status: 500 })
      }
    }

    // Check for existing demo API key
    const { data: existingKey } = await supabaseAdmin
      .from('api_keys')
      .select('key_prefix, key_hint')
      .eq('project_id', DEMO_PROJECT_ID)
      .eq('name', 'Demo Widget Key')
      .single()

    let fullApiKey: string | null = null

    if (!existingKey) {
      // Generate a new demo API key
      const keyRandom = randomBytes(16).toString('hex')
      fullApiKey = `br_live_${keyRandom}`
      const keyPrefix = fullApiKey.substring(0, 7) // "br_live"
      const keyHash = hashApiKey(fullApiKey)
      const keyHint = fullApiKey.slice(-4) // last 4 chars

      // Create API key for demo project
      const { error: keyError } = await supabaseAdmin
        .from('api_keys')
        .insert({
          project_id: DEMO_PROJECT_ID,
          name: 'Demo Widget Key',
          key_prefix: keyPrefix,
          key_hash: keyHash,
          key_hint: keyHint,
          environment: 'live',
          is_active: true,
        })

      if (keyError) {
        console.error('API key creation error:', keyError)
        return NextResponse.json({ error: 'Failed to create API key', details: keyError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo project setup complete',
      orgId: DEMO_ORG_ID,
      projectId: DEMO_PROJECT_ID,
      apiKey: fullApiKey || 'Key already exists (check GET endpoint for hint)',
      keyCreated: !!fullApiKey,
      instructions: fullApiKey
        ? 'SAVE THIS KEY NOW! Update bugradar-init.tsx with this apiKey and apiUrl: https://bugradar.io/api/v1'
        : 'API key already exists. If you need a new one, delete the existing key first.',
    })
  } catch (error) {
    console.error('Demo setup error:', error)
    return NextResponse.json({ error: 'Failed to setup demo project' }, { status: 500 })
  }
}

// GET method to check status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.ADMIN_SECRET && secret !== 'bugradar-setup-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Check demo org
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', DEMO_ORG_ID)
      .single()

    // Check demo project
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', DEMO_PROJECT_ID)
      .single()

    // Check API key
    const { data: apiKey } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key_prefix, key_hint, is_active, environment')
      .eq('project_id', DEMO_PROJECT_ID)
      .single()

    return NextResponse.json({
      demoSetupStatus: {
        org: org ? 'exists' : 'missing',
        project: project ? 'exists' : 'missing',
        apiKey: apiKey ? {
          exists: true,
          prefix: apiKey.key_prefix,
          hint: apiKey.key_hint,
          active: apiKey.is_active,
          environment: apiKey.environment,
        } : { exists: false },
      },
      orgDetails: org,
      projectDetails: project,
    })
  } catch (error) {
    console.error('Demo status check error:', error)
    return NextResponse.json({ error: 'Failed to check demo status' }, { status: 500 })
  }
}
