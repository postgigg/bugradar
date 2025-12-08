import { NextRequest, NextResponse } from 'next/server'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

interface LaunchRequest {
  projectPath: string
  bugId: string
  organizationId: string
  webhookUrl: string
  prompt: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LaunchRequest = await request.json()
    const { projectPath, bugId, organizationId, webhookUrl, prompt } = body

    console.log('[Terminal Launch] Received request:', { projectPath, bugId })

    if (!projectPath) {
      return NextResponse.json({ error: 'Project path required' }, { status: 400 })
    }

    const platform = os.platform()
    console.log('[Terminal Launch] Platform:', platform)

    // Write prompt to a temp file so we can paste it
    const tempDir = os.tmpdir()
    const promptFile = path.join(tempDir, `bugradar-prompt-${bugId.slice(0, 8)}.txt`)
    fs.writeFileSync(promptFile, prompt)
    console.log('[Terminal Launch] Wrote prompt to:', promptFile)

    if (platform === 'darwin') {
      // macOS - Use osascript to:
      // 1. Copy prompt to clipboard
      // 2. Open Terminal
      // 3. Type cd and claude commands
      // 4. Wait for claude to start
      // 5. Shift+Tab to switch to Accept mode
      // 6. Paste the prompt
      // 7. Enter to run

      const appleScript = `
-- Copy prompt to clipboard
set promptText to read POSIX file "${promptFile}"
set the clipboard to promptText

-- Open Terminal and run commands
tell application "Terminal"
    activate

    -- Create new window with cd and claude command
    do script "cd '${projectPath}' && clear && echo '🐛 BugRadar: Starting Claude Code...' && echo '' && claude"

    -- Wait for claude to fully start (may take a moment)
    delay 6

end tell

-- Ensure Terminal is frontmost and send keystrokes
tell application "System Events"
    tell process "Terminal"
        set frontmost to true
        delay 0.3

        -- Send Shift+Tab ONCE to switch to Accept mode
        -- key code 48 is Tab on macOS
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

      console.log('[Terminal Launch] Executing AppleScript...')

      // Execute AppleScript
      await execAsync(`osascript -e '${appleScript.replace(/'/g, "'\"'\"'")}'`)

      return NextResponse.json({
        success: true,
        platform,
        projectPath,
        message: 'Terminal launched and Claude started'
      })

    } else if (platform === 'linux') {
      // Linux - Use xdotool for automation
      const script = `#!/bin/bash
cd "${projectPath}"

# Copy prompt to clipboard
cat "${promptFile}" | xclip -selection clipboard 2>/dev/null || cat "${promptFile}" | xsel --clipboard 2>/dev/null

# Open terminal and run claude
gnome-terminal -- bash -c '
  cd "${projectPath}"
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

      spawn('bash', [scriptPath], { detached: true, stdio: 'ignore' }).unref()

      return NextResponse.json({
        success: true,
        platform,
        projectPath,
        message: 'Terminal launched'
      })

    } else if (platform === 'win32') {
      // Windows - Use PowerShell for automation
      const psScript = `
# Copy prompt to clipboard
Get-Content "${promptFile.replace(/\\/g, '\\\\')}" | Set-Clipboard

# Start new cmd window with claude
Start-Process cmd -ArgumentList '/k', 'cd /d "${projectPath.replace(/\\/g, '\\\\')}" && claude'

Start-Sleep -Seconds 4

# Send keystrokes using SendKeys - Shift+Tab FIRST, then paste, then enter
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait("+{TAB}")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
`

      const psPath = path.join(tempDir, `bugradar-launch-${bugId.slice(0, 8)}.ps1`)
      fs.writeFileSync(psPath, psScript)

      spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', psPath], {
        detached: true,
        stdio: 'ignore'
      }).unref()

      return NextResponse.json({
        success: true,
        platform,
        projectPath,
        message: 'Terminal launched'
      })

    } else {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 })
    }

  } catch (error) {
    console.error('[Terminal Launch Error]', error)
    return NextResponse.json({
      error: 'Failed to launch terminal',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
