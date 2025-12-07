import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Webhook endpoint for Claude Code to report bug fix progress
// Claude will call this endpoint when:
// 1. Fix started
// 2. Fix in progress (with updates)
// 3. Fix completed
// 4. Fix failed

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ClaudeWebhookPayload {
  bugId: string
  projectId?: string
  organizationId?: string
  event: 'fix_started' | 'fix_progress' | 'fix_completed' | 'fix_failed'
  message?: string
  summary?: string // Direct summary from Claude
  filesChanged?: string[] // Direct files list from Claude
  codeChanges?: {
    files: string[]
    summary: string
  }
  timestamp?: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload: ClaudeWebhookPayload = await request.json()

    // Validate required fields
    if (!payload.bugId || !payload.event) {
      return NextResponse.json(
        { error: 'Missing required fields: bugId and event' },
        { status: 400 }
      )
    }

    // Verify the bug exists
    const { data: bug, error: bugError } = await supabase
      .from('bugs')
      .select('id, status, title, project_id')
      .eq('id', payload.bugId)
      .single()

    if (bugError || !bug) {
      return NextResponse.json(
        { error: 'Bug not found' },
        { status: 404 }
      )
    }

    // Handle different events
    switch (payload.event) {
      case 'fix_started':
        // Update bug status to in_progress
        await supabase
          .from('bugs')
          .update({
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', payload.bugId)

        // Add activity log
        await supabase.from('bug_activities').insert({
          bug_id: payload.bugId,
          activity_type: 'status_change',
          old_value: bug.status,
          new_value: 'in_progress',
          created_at: new Date().toISOString()
        })

        // Add comment about Claude starting
        await supabase.from('bug_comments').insert({
          bug_id: payload.bugId,
          content: `🤖 **Claude Code Started**\n\nClaude is now analyzing and fixing this bug.\n\n${payload.message || ''}`,
          is_internal: true,
          created_at: new Date().toISOString()
        })
        break

      case 'fix_progress':
        // Add progress comment
        await supabase.from('bug_comments').insert({
          bug_id: payload.bugId,
          content: `🔄 **Fix Progress Update**\n\n${payload.message || 'Working on the fix...'}`,
          is_internal: true,
          created_at: new Date().toISOString()
        })
        break

      case 'fix_completed':
        // Get summary and files from either format
        const summary = payload.summary || payload.codeChanges?.summary || ''
        const filesChanged = payload.filesChanged || payload.codeChanges?.files || []

        // Update bug status to resolved and save the fix summary
        await supabase
          .from('bugs')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            claude_fixing: false,
            claude_fix_completed_at: new Date().toISOString(),
            claude_fix_summary: summary,
            claude_fix_files: filesChanged
          })
          .eq('id', payload.bugId)

        // Add activity log
        await supabase.from('bug_activities').insert({
          bug_id: payload.bugId,
          activity_type: 'status_change',
          old_value: bug.status,
          new_value: 'resolved',
          created_at: new Date().toISOString()
        })

        // Build completion comment with summary and files
        let completionMessage = `✅ **Fixed by Claude Code**\n\n`

        if (summary) {
          completionMessage += `**What was done:**\n${summary}\n\n`
        } else {
          completionMessage += `${payload.message || 'The fix has been completed successfully.'}\n\n`
        }

        if (filesChanged.length > 0) {
          completionMessage += `**Files Modified:**\n${filesChanged.map(f => `- \`${f}\``).join('\n')}`
        }

        await supabase.from('bug_comments').insert({
          bug_id: payload.bugId,
          content: completionMessage,
          is_internal: true,
          created_at: new Date().toISOString()
        })

        console.log('[Claude Webhook] Fix completed:', {
          bugId: payload.bugId,
          summary: summary?.slice(0, 100),
          filesCount: filesChanged.length
        })
        break

      case 'fix_failed':
        // Add failure comment
        await supabase.from('bug_comments').insert({
          bug_id: payload.bugId,
          content: `❌ **Fix Failed**\n\n${payload.message || 'The automated fix could not be completed. Manual intervention may be required.'}`,
          is_internal: true,
          created_at: new Date().toISOString()
        })
        break
    }

    return NextResponse.json({
      success: true,
      event: payload.event,
      bugId: payload.bugId
    })

  } catch (error) {
    console.error('[Claude Webhook Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'claude-code-webhook',
    events: ['fix_started', 'fix_progress', 'fix_completed', 'fix_failed']
  })
}
