import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for demo account creation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Generate random demo user data
function generateDemoUser() {
  const id = Math.random().toString(36).substring(2, 8)
  const adjectives = ['Swift', 'Clever', 'Mighty', 'Brave', 'Quick', 'Smart', 'Bold', 'Sharp']
  const nouns = ['Developer', 'Coder', 'Engineer', 'Builder', 'Maker', 'Creator', 'Hacker', 'Ninja']

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]

  return {
    email: `demo-${id}@bugradar.demo`,
    password: `Demo${id}Pass!`,
    fullName: `${adjective} ${noun}`,
  }
}

export async function POST() {
  try {
    const demoUser = generateDemoUser()

    // Create the demo user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true, // Auto-confirm email for demo
      user_metadata: {
        full_name: demoUser.fullName,
        is_demo: true,
      },
    })

    if (authError) {
      console.error('Demo user creation error:', authError)
      return NextResponse.json({ error: 'Failed to create demo account' }, { status: 500 })
    }

    // Create user record in users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: demoUser.email,
        full_name: demoUser.fullName,
      })

    if (userError) {
      console.error('User record creation error:', userError)
    }

    // Create a demo organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: `${demoUser.fullName}'s Workspace`,
        slug: `demo-${Math.random().toString(36).substring(2, 10)}`,
      })
      .select()
      .single()

    if (orgError) {
      console.error('Org creation error:', orgError)
      return NextResponse.json({ error: 'Failed to create demo organization' }, { status: 500 })
    }

    // Add user as org owner
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: authData.user.id,
        role: 'owner',
      })

    if (memberError) {
      console.error('Member creation error:', memberError)
    }

    // Create demo subscription
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        organization_id: org.id,
        plan_tier: 'free',
        status: 'active',
        max_bugs_per_month: 50,
        ai_credits_limit: 10,
        ai_credits_used: 0,
      })

    if (subError) {
      console.error('Subscription creation error:', subError)
    }

    // Create a demo project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        organization_id: org.id,
        name: 'Demo Project',
        description: 'Try out BugRadar with this demo project',
        platform: 'web',
      })
      .select()
      .single()

    if (projectError) {
      console.error('Project creation error:', projectError)
    }

    // Add some sample bugs
    if (project) {
      const sampleBugs = [
        {
          project_id: project.id,
          organization_id: org.id,
          title: 'Login button not responding on mobile',
          description: 'When I tap the login button on my iPhone, nothing happens. Expected to see the login form.',
          status: 'open',
          priority: 'high',
          reporter_email: 'tester@example.com',
          page_url: 'https://example.com/login',
          browser: 'Safari',
          os: 'iOS 17',
        },
        {
          project_id: project.id,
          organization_id: org.id,
          title: 'Dark mode toggle doesn\'t persist',
          description: 'After enabling dark mode and refreshing the page, it resets to light mode.',
          status: 'in_progress',
          priority: 'medium',
          reporter_email: 'user@example.com',
          page_url: 'https://example.com/settings',
          browser: 'Chrome',
          os: 'macOS',
        },
        {
          project_id: project.id,
          organization_id: org.id,
          title: 'Typo in welcome email',
          description: 'The welcome email says "Welome" instead of "Welcome"',
          status: 'open',
          priority: 'low',
          reporter_email: 'feedback@example.com',
        },
      ]

      const { error: bugsError } = await supabaseAdmin
        .from('bugs')
        .insert(sampleBugs)

      if (bugsError) {
        console.error('Sample bugs creation error:', bugsError)
      }
    }

    // Return credentials for client to sign in
    return NextResponse.json({
      email: demoUser.email,
      password: demoUser.password,
      fullName: demoUser.fullName,
    })
  } catch (error) {
    console.error('Demo creation error:', error)
    return NextResponse.json({ error: 'Failed to create demo account' }, { status: 500 })
  }
}
