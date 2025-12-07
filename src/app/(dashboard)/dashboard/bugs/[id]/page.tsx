import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BugDetail } from './components/bug-detail'

interface BugPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BugPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: bug } = await supabase
    .from('bugs')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: bug ? `${bug.title} | BugRadar` : 'Action | BugRadar',
  }
}

export default async function BugPage({ params }: BugPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: bug, error } = await supabase
    .from('bugs')
    .select(`
      *,
      projects(id, name, slug, local_path),
      users:assigned_to(id, full_name, email, avatar_url),
      reporter:reported_by(id, full_name, email),
      bug_elements(*),
      bug_activities(
        id, activity_type, old_value, new_value, created_at,
        users:user_id(full_name, email)
      ),
      bug_comments(
        id, content, is_internal, created_at,
        users:user_id(full_name, email, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !bug) {
    notFound()
  }

  // Get team members for assignment dropdown
  const { data: { user } } = await supabase.auth.getUser()
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user?.id)
    .order('joined_at', { ascending: false })
    .limit(1)

  const membership = memberships?.[0]

  const { data: teamMembers } = await supabase
    .from('organization_members')
    .select('user_id, users(id, full_name, email)')
    .eq('organization_id', membership?.organization_id || '')

  // Get subscription for AI credits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('ai_credits_used, ai_credits_limit, plan_tier')
    .eq('organization_id', membership?.organization_id || '')
    .single()

  return (
    <BugDetail
      bug={bug}
      teamMembers={teamMembers || []}
      subscription={subscription || { ai_credits_used: 0, ai_credits_limit: 10, plan_tier: 'free' }}
      organizationId={membership?.organization_id}
    />
  )
}
