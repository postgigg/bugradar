import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

/**
 * BugRadar Claude Code Launcher API
 *
 * This endpoint is called by the BugRadar SDK overlay when the user clicks "Quick Fix".
 * It launches Claude Code in the terminal with the bug context pre-loaded.
 *
 * This only works when running locally (localhost) because it needs to open Terminal.
 */

interface LaunchRequest {
  bugId: string
  bugTitle: string
  description?: string
  screenshotUrl?: string
  pageUrl?: string
  elements?: Array<{
    selector: string
    tagName: string
    text?: string
    note?: string
  }>
  consoleErrors?: string[]
  projectPath?: string
  organizationId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LaunchRequest = await request.json()
    const {
      bugId,
      bugTitle,
      description,
      screenshotUrl,
      pageUrl,
      elements,
      consoleErrors,
      projectPath,
      organizationId
    } = body

    console.log('[BugRadar Launch] Received request:', { bugId, bugTitle })

    // Get project path - use provided path or try to detect from cwd
    const targetPath = projectPath || process.cwd()

    const platform = os.platform()
    console.log('[BugRadar Launch] Platform:', platform)

    // Build the prompt
    const prompt = buildFixPrompt({
      bugId,
      bugTitle,
      description,
      screenshotUrl,
      pageUrl,
      elements,
      consoleErrors,
      organizationId,
    })

    // Write prompt to a temp file
    const tempDir = os.tmpdir()
    const promptFile = path.join(tempDir, `bugradar-prompt-${bugId.slice(0, 8)}.txt`)
    fs.writeFileSync(promptFile, prompt)
    console.log('[BugRadar Launch] Wrote prompt to:', promptFile)

    if (platform === 'darwin') {
      // macOS - Use AppleScript to open Terminal and run Claude
      const appleScript = `
-- Copy prompt to clipboard
set promptText to read POSIX file "${promptFile}"
set the clipboard to promptText

-- Open Terminal and run commands
tell application "Terminal"
    activate

    -- Create new window with cd and claude command
    do script "cd '${targetPath}' && clear && echo '🐛 BugRadar: Starting Claude Code...' && echo '' && claude"

    -- Wait for claude to fully start
    delay 6

end tell

-- Ensure Terminal is frontmost and send keystrokes
tell application "System Events"
    tell process "Terminal"
        set frontmost to true
        delay 0.3

        -- Send Shift+Tab to switch to Accept mode
        key code 48 using {shift down}
        delay 0.8

        -- Paste the prompt (Cmd+V)
        keystroke "v" using {command down}
        delay 0.8

        -- Press Enter to submit
        key code 36
    end tell
end tell
`

      console.log('[BugRadar Launch] Executing AppleScript...')
      await execAsync(`osascript -e '${appleScript.replace(/'/g, "'\"'\"'")}'`)

      return NextResponse.json({
        success: true,
        platform,
        projectPath: targetPath,
        message: 'Terminal launched and Claude started'
      })

    } else if (platform === 'linux') {
      // Linux - Use xdotool for automation
      const script = `#!/bin/bash
cd "${targetPath}"

# Copy prompt to clipboard
cat "${promptFile}" | xclip -selection clipboard 2>/dev/null || cat "${promptFile}" | xsel --clipboard 2>/dev/null

# Open terminal and run claude
gnome-terminal -- bash -c '
  cd "${targetPath}"
  echo "🐛 BugRadar: Starting Claude Code..."
  claude
' &

sleep 4

# Use xdotool - Shift+Tab FIRST, then paste, then enter
xdotool key shift+Tab
sleep 0.5
xdotool key ctrl+v
sleep 0.5
xdotool key Return
`

      const scriptPath = path.join(tempDir, `bugradar-launch-${bugId.slice(0, 8)}.sh`)
      fs.writeFileSync(scriptPath, script, { mode: 0o755 })

      const { spawn } = await import('child_process')
      spawn('bash', [scriptPath], { detached: true, stdio: 'ignore' }).unref()

      return NextResponse.json({
        success: true,
        platform,
        projectPath: targetPath,
        message: 'Terminal launched'
      })

    } else if (platform === 'win32') {
      // Windows - Use PowerShell for automation
      const psScript = `
# Copy prompt to clipboard
Get-Content "${promptFile.replace(/\\/g, '\\\\')}" | Set-Clipboard

# Start new cmd window with claude
Start-Process cmd -ArgumentList '/k', 'cd /d "${targetPath.replace(/\\/g, '\\\\')}" && claude'

Start-Sleep -Seconds 4

# Send keystrokes - Shift+Tab FIRST, then paste, then enter
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait("+{TAB}")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
`

      const psPath = path.join(tempDir, `bugradar-launch-${bugId.slice(0, 8)}.ps1`)
      fs.writeFileSync(psPath, psScript)

      const { spawn } = await import('child_process')
      spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', psPath], {
        detached: true,
        stdio: 'ignore'
      }).unref()

      return NextResponse.json({
        success: true,
        platform,
        projectPath: targetPath,
        message: 'Terminal launched'
      })

    } else {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 })
    }

  } catch (error) {
    console.error('[BugRadar Launch Error]', error)
    return NextResponse.json({
      error: 'Failed to launch terminal',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function buildFixPrompt(data: {
  bugId: string
  bugTitle: string
  description?: string
  screenshotUrl?: string
  pageUrl?: string
  elements?: Array<{
    selector: string
    tagName: string
    text?: string
    note?: string
  }>
  consoleErrors?: string[]
  organizationId?: string
}): string {
  const webhookUrl = 'https://bugradar.io/api/webhooks/claude-code'

  // Build elements section
  let elementsSection = ''
  if (data.elements && data.elements.length > 0) {
    elementsSection = `## Selected Elements
${data.elements.map((el, i) => {
  let elementInfo = `${i + 1}. **<${el.tagName}>** element`
  if (el.text) elementInfo += `\n   - Text: "${el.text.slice(0, 100)}${el.text.length > 100 ? '...' : ''}"`
  if (el.selector) elementInfo += `\n   - Selector: \`${el.selector}\``
  if (el.note) elementInfo += `\n   - Note: ${el.note}`
  return elementInfo
}).join('\n\n')}

`
  }

  // Build screenshot section
  let screenshotSection = ''
  if (data.screenshotUrl) {
    screenshotSection = `## Screenshot - IMPORTANT: View This First!
A screenshot of the issue has been captured. **You MUST view this screenshot before starting work.**

**Screenshot URL:** ${data.screenshotUrl}

**Action Required:** Use the Read tool to view this image URL.

`
  }

  // Console errors section
  let consoleSection = ''
  if (data.consoleErrors && data.consoleErrors.length > 0) {
    consoleSection = `## Console Errors
\`\`\`
${data.consoleErrors.slice(0, 10).join('\n')}
\`\`\`

`
  }

  return `# 🐛 BugRadar Bug Fix Request

## Request Details
- **ID:** ${data.bugId}
- **Title:** ${data.bugTitle}
${data.pageUrl ? `- **Page URL:** ${data.pageUrl}` : ''}

## Description
${data.description || 'No description provided.'}

${screenshotSection}${elementsSection}${consoleSection}

## Your Task
1. **FIRST: View the screenshot URL above** using the Read tool
2. Analyze the issue based on the screenshot and information above
3. Locate the elements by their selectors in the codebase
4. Find the root cause
5. Implement a fix
6. Test the fix works correctly

## 🚨 CRITICAL RULES - READ BEFORE MAKING ANY CHANGES

### ⛔ ABSOLUTE RULE #1: NEVER RENAME VARIABLES OR DATABASE FIELDS ⛔

**THIS IS THE MOST IMPORTANT RULE - VIOLATING IT WILL CRASH THE APPLICATION**

#### BEFORE CHANGING ANY VARIABLE OR FIELD NAME:
1. **STOP** - Check what the ACTUAL field name is in the database
2. **VERIFY** - Search the codebase for ALL uses of this variable/field
3. **COUNT IMPACT** - How many files use this name?
4. **DO NOT CHANGE IT** - Even if the name seems wrong or inconsistent

#### DATABASE IS THE SOURCE OF TRUTH:
- If database has field \`type\`, code MUST use \`type\` (NOT \`service_type\`)
- NEVER create new variable names for existing database fields
- NEVER rename database columns without explicit approval

#### FORBIDDEN ACTIONS - THESE WILL BREAK THE APP:
- ❌ Renaming database columns
- ❌ Creating new variable names for existing fields
- ❌ "Improving" variable names that are already in use
- ❌ Refactoring field names for "consistency"

### MANDATORY: Read Files First

**YOU MUST READ THE FILES BEFORE MAKING ANY CHANGES:**
1. **ALWAYS use the Read tool to read files before editing them**
2. **NEVER create duplicate files** - check if files already exist first
3. **NEVER guess at file contents** - always read the actual code

---

## Webhook Integration - CRITICAL
When you complete the task, you MUST send a webhook:
\`\`\`bash
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bugId": "${data.bugId}",
    ${data.organizationId ? `"organizationId": "${data.organizationId}",` : ''}
    "event": "fix_completed",
    "summary": "YOUR_SUMMARY_HERE",
    "filesChanged": ["file1.tsx"],
    "message": "Completed"
  }'
\`\`\`

Please fix this bug.
`
}
