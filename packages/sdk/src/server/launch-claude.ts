/**
 * BugRadar Terminal Launch Helper
 *
 * === Next.js App Router ===
 * // app/api/bugradar/launch-claude/route.ts
 * export { POST } from 'bugradar/server'
 *
 * === Next.js Pages Router ===
 * // pages/api/bugradar/launch-claude.ts
 * export { default } from 'bugradar/server'
 *
 * === Express / Vite / Node.js ===
 * // server.js or routes/bugradar.js
 * import { launchClaude } from 'bugradar/server'
 * app.post('/api/bugradar/launch-claude', async (req, res) => {
 *   const result = await launchClaude(req.body)
 *   res.json(result)
 * })
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

interface LaunchRequest {
  bugId: string
  bugTitle?: string
  description?: string
  pageUrl?: string
  consoleErrors?: string[]
  projectPath?: string
  prompt?: string
}

// Next.js App Router handler
export async function POST(request: Request) {
  try {
    const body: LaunchRequest = await request.json()
    const result = await launchClaude(body)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to launch terminal',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Pages Router / Express handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await launchClaude(req.body)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to launch terminal',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Export for Express / Vite / custom servers
export async function launchClaude(body: LaunchRequest) {
  const { bugId, bugTitle, description, pageUrl, consoleErrors, projectPath, prompt } = body

  console.log('[BugRadar] Launching Claude for bug:', bugId)

  const targetPath = projectPath || process.cwd()
  const platform = os.platform()

  // Build prompt if not provided
  const fixPrompt = prompt || buildPrompt({ bugId, bugTitle, description, pageUrl, consoleErrors })

  // Write prompt to temp file
  const tempDir = os.tmpdir()
  const promptFile = path.join(tempDir, `bugradar-prompt-${bugId.slice(0, 8)}.txt`)
  fs.writeFileSync(promptFile, fixPrompt)

  if (platform === 'darwin') {
    // macOS
    const appleScript = `
set promptText to read POSIX file "${promptFile}"
set the clipboard to promptText

tell application "Terminal"
    activate
    do script "cd '${targetPath}' && clear && echo '🐛 BugRadar: Starting Claude Code...' && echo '' && claude"
    delay 6
end tell

tell application "System Events"
    tell process "Terminal"
        set frontmost to true
        delay 0.3
        key code 48 using {shift down}
        delay 0.8
        keystroke "v" using {command down}
        delay 0.8
        key code 36
    end tell
end tell
`
    await execAsync(`osascript -e '${appleScript.replace(/'/g, "'\"'\"'")}'`)
  } else if (platform === 'linux') {
    const script = `#!/bin/bash
cd "${targetPath}"
cat "${promptFile}" | xclip -selection clipboard 2>/dev/null || cat "${promptFile}" | xsel --clipboard 2>/dev/null
gnome-terminal -- bash -c 'cd "${targetPath}" && echo "🐛 BugRadar: Starting Claude Code..." && claude' &
sleep 4
xdotool key shift+Tab
sleep 0.5
xdotool key ctrl+v
sleep 0.5
xdotool key Return
`
    const scriptPath = path.join(tempDir, `bugradar-launch-${bugId.slice(0, 8)}.sh`)
    fs.writeFileSync(scriptPath, script, { mode: 0o755 })
    exec(`bash ${scriptPath}`)
  } else if (platform === 'win32') {
    const psScript = `
Get-Content "${promptFile.replace(/\\/g, '\\\\')}" | Set-Clipboard
Start-Process cmd -ArgumentList '/k', 'cd /d "${targetPath.replace(/\\/g, '\\\\')}" && claude'
Start-Sleep -Seconds 4
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait("+{TAB}")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
`
    const psPath = path.join(tempDir, `bugradar-launch-${bugId.slice(0, 8)}.ps1`)
    fs.writeFileSync(psPath, psScript)
    exec(`powershell -ExecutionPolicy Bypass -File "${psPath}"`)
  }

  return { success: true, platform, projectPath: targetPath }
}

function buildPrompt(data: Partial<LaunchRequest>): string {
  return `# 🐛 BugRadar Bug Fix Request

## Bug Details
- **ID:** ${data.bugId}
${data.bugTitle ? `- **Title:** ${data.bugTitle}` : ''}
${data.pageUrl ? `- **Page URL:** ${data.pageUrl}` : ''}

## Description
${data.description || 'No description provided.'}

${data.consoleErrors?.length ? `## Console Errors
\`\`\`
${data.consoleErrors.slice(0, 10).join('\n')}
\`\`\`
` : ''}

## Your Task
1. Analyze the bug
2. Find the root cause
3. Implement a fix
4. Test it works

## Webhook (send when done)
\`\`\`bash
curl -X POST "https://bugradar.io/api/webhooks/claude-code" \\
  -H "Content-Type: application/json" \\
  -d '{"bugId":"${data.bugId}","event":"fix_completed","summary":"YOUR_SUMMARY","filesChanged":["file.tsx"]}'
\`\`\`
`
}
