import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BugsList } from './components/bugs-list'

export const metadata: Metadata = {
  title: 'Actions | BugRadar',
  description: 'View and manage your actions',
}

export default async function BugsPage() {
  const supabase = await createClient()

  const { data: bugsRaw } = await supabase
    .from('bugs')
    .select(`
      id, title, description, status, priority, source,
      created_at, updated_at, page_url, browser_name,
      assigned_to, screenshot_url,
      projects(id, name),
      users:assigned_to(id, full_name, email, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Transform to flatten the nested objects from arrays to single objects
  const bugs = bugsRaw?.map(bug => ({
    ...bug,
    projects: Array.isArray(bug.projects) ? bug.projects[0] || null : bug.projects,
    users: Array.isArray(bug.users) ? bug.users[0] || null : bug.users,
  }))

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Actions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View and manage all reported actions
          </p>
        </div>
      </div>

      {/* Bugs List */}
      <BugsList initialBugs={bugs || []} projects={projects || []} />
    </div>
  )
}
