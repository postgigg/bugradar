import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bugId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, claude_fixing } = body

    // Build update object
    const updates: Record<string, any> = {}

    if (status) {
      updates.status = status
    }

    if (typeof claude_fixing === 'boolean') {
      updates.claude_fixing = claude_fixing
      if (claude_fixing) {
        updates.claude_fix_started_at = new Date().toISOString()
      }
    }

    const { data: bug, error } = await supabase
      .from('bugs')
      .update(updates)
      .eq('id', bugId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update bug status:', error)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, bug })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
