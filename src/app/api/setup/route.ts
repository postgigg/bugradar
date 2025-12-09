import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const { orgName } = await request.json()

    if (!orgName?.trim()) {
      return NextResponse.json({ error: 'Organization name required' }, { status: 400 })
    }

    // Check if organization already exists
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    if (existingOrg) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 })
    }

    // Generate slug from name
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Create organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: orgName,
        slug: slug || 'my-org',
      })
      .select()
      .single()

    if (orgError) {
      console.error('Failed to create organization:', orgError)
      return NextResponse.json({ error: `Failed to create organization: ${orgError.message}` }, { status: 500 })
    }

    // Create default project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        organization_id: org.id,
        name: 'Default Project',
        slug: 'default',
        description: 'Your first project',
        platform: 'web',
      })
      .select()
      .single()

    if (projectError) {
      console.error('Failed to create project:', projectError)
      return NextResponse.json({ error: `Failed to create project: ${projectError.message}` }, { status: 500 })
    }

    // Create API key for the project
    const rawKey = `br_live_${crypto.randomBytes(24).toString('hex')}`
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const keyHint = rawKey.slice(-8)

    const { error: keyError } = await supabaseAdmin
      .from('api_keys')
      .insert({
        project_id: project.id,
        name: 'Default API Key',
        key_prefix: 'br_live',
        key_hash: keyHash,
        key_hint: keyHint,
        environment: 'live',
        is_active: true,
      })

    if (keyError) {
      console.error('Failed to create API key:', keyError)
      return NextResponse.json({ error: `Failed to create API key: ${keyError.message}` }, { status: 500 })
    }

    // Create unlimited subscription for self-hosted
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        organization_id: org.id,
        plan_tier: 'enterprise', // Self-hosted gets enterprise tier
        status: 'active',
        max_projects: 9999,
        max_bugs_per_month: 999999,
        max_team_members: 9999,
        ai_credits_limit: 999999,
        ai_credits_used: 0,
        features: {
          ai_enhance: true,
          screenshot: true,
          api_access: true,
          priority_support: true,
          claude_code: true,
        },
      })

    if (subError) {
      console.error('Failed to create subscription:', subError)
      // Non-fatal - continue anyway
    }

    // Create storage bucket for screenshots
    const { error: bucketError } = await supabaseAdmin
      .storage
      .createBucket('bug-screenshots', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Failed to create storage bucket:', bucketError)
      // Non-fatal - continue anyway
    }

    return NextResponse.json({
      success: true,
      organization: org,
      project: project,
      apiKey: rawKey, // Only shown once!
      message: 'Setup complete! Save your API key - it will not be shown again.',
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    )
  }
}
