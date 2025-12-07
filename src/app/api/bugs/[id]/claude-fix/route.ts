import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Generate Claude Code fix prompt and terminal script
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bugId } = await params
    const supabase = await createClient()

    // Get the bug with all context
    const { data: bug, error } = await supabase
      .from('bugs')
      .select(`
        *,
        projects(id, name, slug, repository_url),
        bug_elements(*),
        bug_comments(content, created_at)
      `)
      .eq('id', bugId)
      .single()

    if (error || !bug) {
      return NextResponse.json({ error: 'Bug not found' }, { status: 404 })
    }

    // Get user's organization for webhook URL
    const { data: { user } } = await supabase.auth.getUser()
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user?.id)
      .limit(1)

    const orgId = membership?.[0]?.organization_id

    // Build the webhook URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/webhooks/claude-code`

    // Build comprehensive fix prompt
    const fixPrompt = buildFixPrompt(bug, webhookUrl, orgId)

    // Build terminal script (AppleScript for macOS)
    const projectPath = bug.projects?.repository_url
      ? extractLocalPath(bug.projects.repository_url)
      : bug.page_url ? extractProjectPath(bug.page_url) : '~/Projects'

    const terminalScript = buildTerminalScript(projectPath, fixPrompt, webhookUrl, bugId, orgId)

    return NextResponse.json({
      bugId,
      prompt: fixPrompt,
      script: terminalScript,
      projectPath,
      webhookUrl,
      bug: {
        title: bug.title,
        description: bug.description,
        priority: bug.priority,
        status: bug.status
      }
    })

  } catch (error) {
    console.error('[Claude Fix Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildFixPrompt(bug: any, webhookUrl: string, orgId: string): string {
  const consoleErrors = bug.console_logs?.filter((l: any) => l.type === 'error') || []
  const networkErrors = bug.network_logs?.filter((l: any) => l.status >= 400) || []

  let prompt = `# BugRadar Fix Request

## Bug Details
- **ID:** ${bug.id}
- **Title:** ${bug.title}
- **Priority:** ${bug.priority?.toUpperCase() || 'MEDIUM'}
- **Status:** ${bug.status}
- **Page URL:** ${bug.page_url || 'N/A'}

## Description
${bug.description || 'No description provided.'}

`

  // Add console errors
  if (consoleErrors.length > 0) {
    prompt += `## Console Errors (${consoleErrors.length})
\`\`\`
${consoleErrors.slice(0, 10).map((e: any) => `[${e.type}] ${e.message}`).join('\n')}
\`\`\`

`
  }

  // Add network errors
  if (networkErrors.length > 0) {
    prompt += `## Network Errors (${networkErrors.length})
${networkErrors.slice(0, 5).map((n: any) => `- ${n.method} ${n.url} → ${n.status} ${n.statusText || ''}`).join('\n')}

`
  }

  // Add selected elements
  if (bug.bug_elements?.length > 0) {
    prompt += `## Affected Elements
${bug.bug_elements.map((el: any) => `- \`${el.selector}\` (${el.tag_name})`).join('\n')}

`
  }

  // Add browser context
  if (bug.browser_context) {
    const ctx = bug.browser_context
    prompt += `## Environment
- **Browser:** ${ctx.browserName} ${ctx.browserVersion}
- **OS:** ${ctx.osName} ${ctx.osVersion}
- **Viewport:** ${ctx.viewportSize}
- **Device:** ${ctx.deviceType}

`
  }

  // Add fix instructions with webhook integration
  prompt += `## Your Task
1. Analyze the bug based on the information above
2. Find the root cause in the codebase
3. Implement a fix
4. Test the fix works
5. **IMPORTANT:** When done, send a webhook to mark the bug as fixed

## Webhook Integration
After fixing, run this curl command to update the bug status:

\`\`\`bash
# When you START fixing:
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"bugId":"${bug.id}","organizationId":"${orgId}","event":"fix_started","message":"Analyzing bug and implementing fix"}'

# When you COMPLETE the fix:
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"bugId":"${bug.id}","organizationId":"${orgId}","event":"fix_completed","message":"Bug has been fixed","codeChanges":{"files":["file1.ts","file2.ts"],"summary":"Description of changes"}}'
\`\`\`

## Ready to Fix
Please analyze this bug and implement a fix. Start by understanding the error, then locate the relevant code, and apply the fix.
`

  return prompt
}

function buildTerminalScript(
  projectPath: string,
  prompt: string,
  webhookUrl: string,
  bugId: string,
  orgId: string
): string {
  // Escape special characters for shell
  const escapedPrompt = prompt
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')

  // AppleScript to open Terminal, cd to project, run claude with prompt
  const appleScript = `
tell application "Terminal"
    activate

    -- Create new window
    do script ""
    delay 0.5

    -- Navigate to project
    do script "cd ${projectPath}" in front window
    delay 0.3

    -- Send webhook that we're starting
    do script "curl -s -X POST '${webhookUrl}' -H 'Content-Type: application/json' -d '{\\\"bugId\\\":\\\"${bugId}\\\",\\\"organizationId\\\":\\\"${orgId}\\\",\\\"event\\\":\\\"fix_started\\\",\\\"message\\\":\\\"Claude Code session started\\\"}' > /dev/null" in front window
    delay 0.5

    -- Launch Claude with the prompt
    do script "claude" in front window
    delay 2

    -- Type the prompt (simulating paste)
    tell application "System Events"
        keystroke "${escapedPrompt.substring(0, 500)}..."
        delay 0.3
        -- Shift+Tab to accept
        key code 48 using shift down
        delay 0.2
        -- Enter to execute
        keystroke return
    end tell
end tell
`

  return appleScript
}

function extractLocalPath(repoUrl: string): string {
  // Convert GitHub URL to assumed local path
  // e.g., https://github.com/user/project → ~/Projects/project
  const match = repoUrl.match(/github\.com\/[\w-]+\/([\w-]+)/)
  if (match) {
    return `~/Projects/${match[1]}`
  }
  return '~/Projects'
}

function extractProjectPath(pageUrl: string): string {
  // Try to guess project path from page URL
  // e.g., http://localhost:3000 → current directory
  if (pageUrl.includes('localhost')) {
    return '.'
  }
  return '~/Projects'
}
