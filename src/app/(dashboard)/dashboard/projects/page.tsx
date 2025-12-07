import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProjectsList } from './components/projects-list'

export const metadata: Metadata = {
  title: 'Projects | BugRadar',
  description: 'Manage your projects',
}

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user?.id)
    .limit(1)

  const membership = memberships?.[0]

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, name, slug, platform, framework, created_at, is_active,
      bugs(count),
      api_keys(count)
    `)
    .eq('organization_id', membership?.organization_id || '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Projects
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your bug tracking projects
          </p>
        </div>
      </div>

      <ProjectsList
        projects={projects || []}
        canManage={membership?.role === 'owner' || membership?.role === 'admin'}
      />
    </div>
  )
}
