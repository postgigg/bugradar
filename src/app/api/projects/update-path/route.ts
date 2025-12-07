import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, localPath } = await req.json()

    if (!projectId || !localPath) {
      return NextResponse.json({ error: 'Project ID and local path required' }, { status: 400 })
    }

    // Try to find membership - check all memberships for this user
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)

    if (!memberships || memberships.length === 0) {
      console.error('No memberships found for user:', user.id)
      return NextResponse.json({ error: 'No organization found' }, { status: 403 })
    }

    // Get all organization IDs the user belongs to
    const orgIds = memberships.map(m => m.organization_id)

    // Update project local_path if project belongs to any of user's orgs
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ local_path: localPath })
      .eq('id', projectId)
      .in('organization_id', orgIds)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update project path:', updateError)
      return NextResponse.json({ error: 'Failed to update path' }, { status: 500 })
    }

    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    console.log('Updated project path:', projectId, localPath)
    return NextResponse.json({ success: true, localPath })
  } catch (error) {
    console.error('Update path error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
