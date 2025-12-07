import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from './components/dashboard-stats'
import { RecentBugs } from './components/recent-bugs'
import { BugBreakdown } from './components/bug-breakdown'

export const metadata: Metadata = {
  title: 'Dashboard | BugRadar',
  description: 'Your bug tracking dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Please log in to view your dashboard.</p>
      </div>
    )
  }

  // Get user's profile for their name
  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email?.split('@')[0] || 'there'

  // Get first organization membership (user might have multiple)
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)

  const organizationId = memberships?.[0]?.organization_id

  if (!organizationId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No organization found. Please complete onboarding.</p>
      </div>
    )
  }

  // Get projects for this organization
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('organization_id', organizationId)

  const projectIds = projects?.map(p => p.id) || []

  // Get recent bugs
  const { data: recentBugsRaw } = await supabase
    .from('bugs')
    .select(`
      id, title, status, priority, created_at, page_url,
      projects(name)
    `)
    .in('project_id', projectIds.length > 0 ? projectIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Transform to flatten nested projects from array to object
  const recentBugs = recentBugsRaw?.map(bug => ({
    ...bug,
    projects: Array.isArray(bug.projects) ? bug.projects[0] || null : bug.projects,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Hello, {userName}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with your actions.
        </p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bugs - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentBugs bugs={recentBugs || []} />
        </div>

        {/* Bug Breakdown */}
        <div>
          <BugBreakdown />
        </div>
      </div>
    </div>
  )
}
