import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TeamList } from './components/team-list'

export const metadata: Metadata = {
  title: 'Team | BugRadar',
  description: 'Manage your team',
}

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: membershipsData } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user?.id)
    .limit(1)

  const membership = membershipsData?.[0]

  const { data: membersRaw } = await supabase
    .from('organization_members')
    .select(`
      id, role, joined_at,
      users(id, full_name, email, avatar_url)
    `)
    .eq('organization_id', membership?.organization_id || '')
    .order('joined_at', { ascending: true })

  // Transform to flatten nested users from array to object
  const members = membersRaw?.map(member => ({
    ...member,
    users: Array.isArray(member.users) ? member.users[0] || null : member.users,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Team
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your team members
          </p>
        </div>
      </div>

      <TeamList
        members={members || []}
        currentUserId={user?.id || ''}
        canManage={membership?.role === 'owner' || membership?.role === 'admin'}
        organizationId={membership?.organization_id || ''}
      />
    </div>
  )
}
