'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Terminal, ExternalLink, Download, Check, Loader2, Zap, AlertCircle, Copy, Sparkles, Play, FolderOpen, Webhook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ClaudeTerminalLauncherProps {
  isOpen: boolean
  onClose: () => void
  bugContext: {
    id: string
    title: string
    description?: string
    consoleErrors?: string[]
    stackTrace?: string
    pageUrl?: string
    codebase?: string
    projectId?: string
    projectPath?: string
    screenshotUrl?: string
    reportType?: 'bug' | 'feedback' | 'change'
    elements?: Array<{
      selector: string
      tagName: string
      text?: string
      note?: string
    }>
  }
  aiCreditsUsed: number
  aiCreditsLimit: number
  organizationId: string
  hasClaudeCodeAccess: boolean
}

interface FixData {
  prompt: string
  script: string
  projectPath: string
  webhookUrl: string
}

export function ClaudeTerminalLauncher({
  isOpen,
  onClose,
  bugContext,
  aiCreditsUsed,
  aiCreditsLimit,
  organizationId,
  hasClaudeCodeAccess
}: ClaudeTerminalLauncherProps) {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fixData, setFixData] = useState<FixData | null>(null)
  const [projectPath, setProjectPath] = useState(bugContext.projectPath || '')
  const [step, setStep] = useState<'setup' | 'ready' | 'launched'>('setup')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [pathWasSaved, setPathWasSaved] = useState(false)

  // Track if we've already auto-launched for this bug
  const [hasAutoLaunched, setHasAutoLaunched] = useState(false)

  const creditsRemaining = aiCreditsLimit - aiCreditsUsed

  // Set webhook URL on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWebhookUrl('https://bugradar.io/api/webhooks/claude-code')
    }
  }, [])

  // Update project path when bugContext changes
  useEffect(() => {
    if (bugContext.projectPath) {
      setProjectPath(bugContext.projectPath)
    }
  }, [bugContext.projectPath])

  // Reset auto-launch flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasAutoLaunched(false)
      setStep('setup')
      setLaunching(false)
    }
  }, [isOpen])

  // Generate fix data and auto-launch if path is saved
  useEffect(() => {
    // Wait for webhookUrl to be set (client-side only)
    if (!webhookUrl) return

    if (isOpen && hasClaudeCodeAccess && !hasAutoLaunched) {
      // Build prompt client-side
      const prompt = buildFixPrompt()
      const savedPath = bugContext.projectPath?.trim() || ''
      const data = {
        prompt,
        script: '',
        projectPath: savedPath,
        webhookUrl
      }
      setFixData(data)
      setStep('ready')
      setLoading(false)

      // Set the project path from saved value
      if (savedPath) {
        setProjectPath(savedPath)
      }

      // If we have a saved project path, auto-launch immediately
      if (savedPath) {
        setHasAutoLaunched(true)
        // Auto-launch after a brief delay to let UI update
        setTimeout(() => {
          handleAutoLaunch(data, savedPath)
        }, 300)
      }
    }
  }, [isOpen, hasClaudeCodeAccess, bugContext.id, hasAutoLaunched, webhookUrl])

  // Auto-launch function (called when projectPath is already saved)
  const handleAutoLaunch = async (data: FixData, savedPath: string) => {
    if (!data || !savedPath) return
    setLaunching(true)

    try {
      // Update bug status to in_progress and set claude_fixing flag
      fetch(`/api/bugs/${bugContext.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_progress',
          claude_fixing: true
        })
      }).catch(err => console.warn('Failed to update bug status:', err))

      // Call the API to automatically open Terminal and run claude
      const response = await fetch('/api/terminal/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath: savedPath,
          bugId: bugContext.id,
          organizationId,
          webhookUrl,
          prompt: data.prompt
        })
      })

      const result = await response.json()

      if (result.success) {
        // Auto-close modal after 2 seconds on success
        setTimeout(() => {
          onClose()
        }, 2000)
        setStep('launched')
      } else {
        console.error('Terminal launch failed:', result.error)
        // Show manual input if auto-launch fails
        setLaunching(false)
        setHasAutoLaunched(false) // Allow retry
      }
    } catch (error) {
      console.error('Failed to auto-launch:', error)
      setLaunching(false)
      setHasAutoLaunched(false) // Allow retry
    }
  }

  const buildFixPrompt = () => {
    const reportType = bugContext.reportType || 'bug'

    // Build elements section
    let elementsSection = ''
    if (bugContext.elements && bugContext.elements.length > 0) {
      elementsSection = `## Selected Elements
${bugContext.elements.map((el, i) => {
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
    if (bugContext.screenshotUrl) {
      screenshotSection = `## Screenshot - IMPORTANT: View This First!
A screenshot of the issue has been captured. **You MUST view this screenshot before starting work.**

**Screenshot URL:** ${bugContext.screenshotUrl}

**Action Required:** Use the Read tool or WebFetch tool to view this image URL. The screenshot shows exactly what the user is experiencing and may contain annotated elements highlighting the problem area.

`
    }

    // Different headers and tasks based on report type
    const typeConfig = {
      bug: {
        emoji: '🐛',
        header: 'Bug Fix Request',
        typeLabel: 'Bug Report',
        tasks: `## Your Task
1. **FIRST: View the screenshot URL above** using the Read tool to see the visual issue
2. Analyze the bug based on the screenshot and information above
3. Locate the elements by their selectors in the codebase
4. Find the root cause of the bug
5. Implement a fix that resolves the issue
6. Test the fix works correctly`,
        action: 'fix this bug'
      },
      feedback: {
        emoji: '💡',
        header: 'Feedback Implementation Request',
        typeLabel: 'Feedback / Suggestion',
        tasks: `## Your Task
1. **FIRST: View the screenshot URL above** using the Read tool to understand the context
2. Analyze the feedback/suggestion provided
3. Evaluate the feasibility of implementing this suggestion
4. If feasible, plan the implementation approach
5. Implement the suggested improvement
6. Test that the implementation matches the user's expectations`,
        action: 'implement this feedback'
      },
      change: {
        emoji: '✏️',
        header: 'Edit / Change Request',
        typeLabel: 'Edit / Change Request',
        tasks: `## Your Task
1. **FIRST: View the screenshot URL above** using the Read tool to see what needs changing
2. Analyze the requested modification
3. Locate the elements by their selectors in the codebase
4. Understand the current implementation
5. Make the requested changes/edits
6. Test that the changes work as expected and don't break existing functionality`,
        action: 'implement this change'
      }
    }

    const config = typeConfig[reportType]

    return `# ${config.emoji} BugRadar ${config.header}

## Request Details
- **ID:** ${bugContext.id}
- **Type:** ${config.typeLabel}
- **Title:** ${bugContext.title}
${bugContext.pageUrl ? `- **Page URL:** ${bugContext.pageUrl}` : ''}
${bugContext.codebase ? `- **Project:** ${bugContext.codebase}` : ''}

## Description
${bugContext.description || 'No description provided.'}

${screenshotSection}${elementsSection}${bugContext.consoleErrors?.length ? `## Console Errors
\`\`\`
${bugContext.consoleErrors.slice(0, 10).join('\n')}
\`\`\`
` : ''}

${config.tasks}

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
- If database has field \`company_name\`, code MUST use \`company_name\` (NOT \`name\` or \`customerName\`)
- NEVER create new variable names for existing database fields
- NEVER rename database columns without explicit approval

#### FORBIDDEN ACTIONS - THESE WILL BREAK THE APP:
- ❌ Renaming database columns (e.g., \`type\` → \`service_type\`)
- ❌ Creating new variable names for existing fields
- ❌ "Improving" variable names that are already in use
- ❌ Refactoring field names for "consistency"
- ❌ Creating aliases or mappings to "fix" naming

#### IMPACT ANALYSIS:
- If changing 1 file would break 50+ files: **DON'T DO IT**
- If database + queries use name A, but 1-2 files use name B: **FIX the 1-2 files to use name A**
- Always choose the path with LEAST total changes

### MANDATORY: Read Files First

**YOU MUST READ THE FILES BEFORE MAKING ANY CHANGES:**
1. **ALWAYS use the Read tool to read files before editing them**
2. **NEVER create duplicate files** - check if files already exist first
3. **NEVER guess at file contents** - always read the actual code
4. **Use Glob tool** to find existing files before creating new ones
5. **Check git status** to see what files already exist

### Before Making ANY Code Change:
1. ✅ Verify database field names (check schema)
2. ✅ Count usage with grep to see how many files use a name
3. ✅ Read all files you'll modify
4. ✅ Check for duplicates before creating files
5. ✅ Use existing variable names EXACTLY as they are
6. ✅ Send webhook when done with fix

---

## Webhook Integration - CRITICAL
When you complete the task, you MUST send a webhook with a summary of your changes. This adds a comment to the bug so the team can see what was fixed.

**Required format:**
\`\`\`bash
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bugId": "${bugContext.id}",
    "organizationId": "${organizationId}",
    "event": "fix_completed",
    "summary": "YOUR_SUMMARY_HERE",
    "filesChanged": ["file1.tsx", "file2.ts"],
    "message": "Completed"
  }' && osascript -e 'tell application "Terminal" to close front window'
\`\`\`

**Summary Guidelines:**
- Write 2-4 sentences describing what you fixed/changed
- Explain the root cause and how you fixed it
- List the key files you modified
- Be specific and technical

**Example:**
\`\`\`bash
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bugId": "${bugContext.id}",
    "organizationId": "${organizationId}",
    "event": "fix_completed",
    "summary": "Fixed the login button not responding by adding proper onClick handler. The issue was caused by a missing event binding in the AuthForm component. Also added loading state to prevent double-clicks.",
    "filesChanged": ["src/components/AuthForm.tsx", "src/hooks/useAuth.ts"],
    "message": "Completed"
  }' && osascript -e 'tell application "Terminal" to close front window'
\`\`\`

**IMPORTANT:** You MUST run this curl command when done. Replace YOUR_SUMMARY_HERE with your actual summary. The Terminal will auto-close after sending.

Please ${config.action}.
`
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const launchTerminal = async () => {
    if (!fixData || !projectPath) return
    setLaunching(true)

    try {
      // Update bug status to in_progress and set claude_fixing flag
      fetch(`/api/bugs/${bugContext.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_progress',
          claude_fixing: true
        })
      }).catch(err => console.warn('Failed to update bug status:', err))

      // Save the project path if it's different from what was stored
      if (bugContext.projectId && projectPath !== bugContext.projectPath) {
        try {
          const saveResponse = await fetch('/api/projects/update-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: bugContext.projectId,
              localPath: projectPath
            })
          })
          if (saveResponse.ok) {
            setPathWasSaved(true)
            console.log('Project path saved successfully')
          }
        } catch (err) {
          console.warn('Failed to save project path:', err)
        }
      }

      // Call the API to automatically open Terminal and run claude
      const response = await fetch('/api/terminal/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath,
          bugId: bugContext.id,
          organizationId,
          webhookUrl,
          prompt: fixData.prompt
        })
      })

      const result = await response.json()

      if (result.success) {
        setStep('launched')
        // Auto-close modal after 2 seconds on success and refresh page
        setTimeout(() => {
          onClose()
          // Refresh the page to show updated project path in sidebar
          if (pathWasSaved) {
            router.refresh()
          }
        }, 2000)
      } else {
        console.error('Terminal launch failed:', result.error)
        // Fallback: copy prompt to clipboard
        await navigator.clipboard.writeText(fixData.prompt)
        setStep('launched')
      }
    } catch (error) {
      console.error('Failed to launch:', error)
      // Fallback: copy prompt to clipboard
      await navigator.clipboard.writeText(fixData?.prompt || '')
      setStep('launched')
    } finally {
      setLaunching(false)
    }
  }

  const copyTerminalCommand = async () => {
    const command = `cd "${projectPath}" && claude`
    await navigator.clipboard.writeText(command)
    setCopied('terminal-cmd')
    setTimeout(() => setCopied(null), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 border-coral-200 dark:border-coral-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <CardHeader className="pb-4 bg-gradient-to-br from-coral-50 to-coral-50 dark:from-coral-900/20 dark:to-coral-900/20 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center shadow-lg shadow-coral-500/25">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Launch Claude Code</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered bug fixing in your terminal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Auto-launching State */}
          {launching && hasAutoLaunched && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center animate-pulse">
                <Terminal className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-900 dark:text-white">Launching Claude Code...</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Opening Terminal with your bug context</p>
              </div>
              <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
            </div>
          )}

          {/* Loading State */}
          {loading && !launching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
              <span className="ml-3 text-slate-500">Preparing fix context...</span>
            </div>
          )}

          {/* Access Check */}
          {!hasClaudeCodeAccess && !launching && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Pro plan required</span>
              </div>
              <p className="text-sm text-amber-500 dark:text-amber-400/80 mt-1">
                Upgrade to Pro or Team plan to use Claude Code integration.
              </p>
            </div>
          )}

          {/* Bug Preview */}
          {!loading && !(launching && hasAutoLaunched) && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Bug to fix</p>
              <p className="font-medium text-slate-900 dark:text-white">{bugContext.title}</p>
              {bugContext.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {bugContext.description}
                </p>
              )}
            </div>
          )}

          {/* Setup Step */}
          {hasClaudeCodeAccess && !loading && step === 'setup' && !(launching && hasAutoLaunched) && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Loading fix context...</p>
            </div>
          )}

          {/* Ready Step */}
          {hasClaudeCodeAccess && !loading && step === 'ready' && fixData && !(launching && hasAutoLaunched) && (
            <div className="space-y-5">
              {/* Project Path Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Project Directory
                </label>
                <input
                  type="text"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  placeholder="/Users/you/Projects/your-project"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400">Enter the full path to your project directory</p>
              </div>

              {/* How it works - Dark terminal style */}
              <div className="p-4 bg-slate-900 rounded-lg space-y-3 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">How it works</p>
                </div>
                <ol className="text-sm text-slate-300 space-y-2.5 list-none pl-0">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-coral-600 text-white text-xs flex items-center justify-center font-medium">1</span>
                    <span>Click <span className="text-coral-400 font-medium">"Launch"</span> to auto-open Terminal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-coral-600 text-white text-xs flex items-center justify-center font-medium">2</span>
                    <span>Claude Code starts with your <span className="text-emerald-400">bug context + screenshot</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-coral-600 text-white text-xs flex items-center justify-center font-medium">3</span>
                    <span>Claude can <span className="text-amber-400">view the screenshot</span> of marked elements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-coral-600 text-white text-xs flex items-center justify-center font-medium">4</span>
                    <span>AI analyzes & implements the fix automatically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-coral-600 text-white text-xs flex items-center justify-center font-medium">5</span>
                    <span>Bug status updates via <span className="text-cyan-400">webhook</span> when done!</span>
                  </li>
                </ol>
              </div>

              {/* Webhook info */}
              <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Webhook className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Automatic Status Updates</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                    Claude will notify BugRadar when the fix is complete, automatically updating the bug status.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={launchTerminal}
                  disabled={launching || !projectPath}
                  className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white h-12"
                >
                  {launching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Launch Claude Code
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => copyToClipboard(fixData.prompt, 'prompt')}
                    variant="secondary"
                    size="sm"
                  >
                    {copied === 'prompt' ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Prompt
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => copyToClipboard(`cd "${projectPath}" && claude`, 'command')}
                    variant="secondary"
                    size="sm"
                  >
                    {copied === 'command' ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Terminal className="w-4 h-4 mr-2" />
                        Copy Command
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Launched Step */}
          {step === 'launched' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">Terminal Launched!</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500">Claude Code is starting with your bug context.</p>
                </div>
              </div>

              <div className="p-4 bg-coral-50 dark:bg-coral-900/20 rounded-lg border border-coral-200 dark:border-coral-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-coral-500" />
                  <p className="text-sm font-medium text-coral-700 dark:text-coral-400">What's happening:</p>
                </div>
                <ol className="text-sm text-coral-600 dark:text-coral-400 space-y-1.5 list-decimal pl-5">
                  <li>Terminal opened with your project directory</li>
                  <li>Claude Code is starting...</li>
                  <li>Bug context pasted automatically</li>
                  <li>Claude will analyze and fix the bug!</li>
                </ol>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> If Terminal didn't open, grant accessibility permissions in System Preferences → Security & Privacy → Privacy → Accessibility.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={copyTerminalCommand}
                  variant="secondary"
                >
                  {copied === 'terminal-cmd' ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4 mr-2" />
                      Copy Command
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => copyToClipboard(fixData?.prompt || '', 'prompt-again')}
                  variant="secondary"
                >
                  {copied === 'prompt-again' ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white"
              >
                Close & Watch Terminal
              </Button>
            </div>
          )}

          {/* Credits Display */}
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <Zap className={cn('w-4 h-4', creditsRemaining > 5 ? 'text-emerald-500' : 'text-amber-500')} />
              {creditsRemaining} AI credits remaining
            </span>
            <a
              href="https://docs.anthropic.com/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-coral-500 hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Install Claude Code
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
