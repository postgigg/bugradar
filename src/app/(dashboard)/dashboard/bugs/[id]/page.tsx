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

  // For self-hosted: get first organization (no auth required)
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  // Self-hosted: unlimited everything
  const unlimitedSubscription = {
    ai_credits_used: 0,
    ai_credits_limit: 999999,
    plan_tier: 'enterprise' as const,
  }

  return (
    <BugDetail
      bug={bug}
      teamMembers={[]}
      subscription={unlimitedSubscription}
      organizationId={org?.id}
    />
  )
}
