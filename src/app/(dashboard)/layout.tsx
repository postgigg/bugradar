import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For self-hosted: check if setup is complete (has organization)
  const supabase = await createClient()

  // Try to get first organization (self-hosted has one org)
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .limit(1)
    .single()

  // If no organization exists, redirect to setup
  if (!organization) {
    redirect('/setup')
  }

  // Create a mock user for self-hosted (single user mode)
  const selfHostedUser = {
    id: 'self-hosted-admin',
    email: 'admin@localhost',
    full_name: 'Admin',
  }

  return (
    <DashboardShell user={selfHostedUser} organization={organization}>
      {children}
    </DashboardShell>
  )
}
