import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with organization
  const { data: profile } = await supabase
    .from('users')
    .select('*, organization_members(organization_id, role, organizations(id, name, slug))')
    .eq('id', user.id)
    .single()

  const organization = profile?.organization_members?.[0]?.organizations

  return (
    <DashboardShell user={profile} organization={organization}>
      {children}
    </DashboardShell>
  )
}
