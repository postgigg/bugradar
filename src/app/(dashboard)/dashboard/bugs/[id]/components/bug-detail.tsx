'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AITerminal } from '@/components/ai-terminal'
import { ClaudeTerminalLauncher } from '@/components/claude-terminal-launcher'
import { ScreenshotViewer } from '@/components/screenshot-viewer'
import { ScreenshotBadgeOverlay } from '@/components/screenshot-badge-overlay'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, ExternalLink, Clock, Monitor,
  Globe, User, MessageSquare, History,
  CheckCircle, AlertTriangle, Copy, Check,
  Terminal, Sparkles, Zap, Code2, Bug, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { priorityColors, statusColors } from '@/lib/brand'

// Report type colors for AI Assistant card
const reportTypeColors = {
  bug: {
    border: 'border-red-200 dark:border-red-800',
    bg: 'bg-gradient-to-br from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20',
    iconBg: 'from-red-500 to-red-600',
    buttonBg: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    creditBorder: 'border-red-200 dark:border-red-700',
  },
  change: {
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20',
    iconBg: 'from-blue-500 to-blue-600',
    buttonBg: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    creditBorder: 'border-blue-200 dark:border-blue-700',
  },
  feedback: {
    border: 'border-green-200 dark:border-green-800',
    bg: 'bg-gradient-to-br from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900/20',
    iconBg: 'from-green-500 to-green-600',
    buttonBg: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    creditBorder: 'border-green-200 dark:border-green-700',
  },
}

interface BugDetailProps {
  bug: any
  teamMembers: any[]
  subscription?: {
    ai_credits_used: number
    ai_credits_limit: number
    plan_tier?: string
  }
  organizationId?: string
}

export function BugDetail({ bug, teamMembers, subscription, organizationId }: BugDetailProps) {
  const router = useRouter()
  const supabase = createClient()

  const [status, setStatus] = useState(bug.status)
  const [priority, setPriority] = useState(bug.priority)
  const [assignedTo, setAssignedTo] = useState(bug.assigned_to || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [comment, setComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const [showAITerminal, setShowAITerminal] = useState(false)
  const [showClaudeLauncher, setShowClaudeLauncher] = useState(false)
  const [aiCreditsUsed, setAiCreditsUsed] = useState(subscription?.ai_credits_used || 0)
  const [isLaunchingClaude, setIsLaunchingClaude] = useState(false)

  // Check if user has Claude Code access (Pro or Team plan)
  const hasClaudeCodeAccess = subscription?.plan_tier === 'pro' || subscription?.plan_tier === 'team' || subscription?.plan_tier === 'enterprise'

  const priorityStyle = priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium
  const statusStyle = statusColors[status as keyof typeof statusColors] || statusColors.open

  // Get report type styling (bug=red, change=blue, feedback=green)
  const reportType = (bug.custom_metadata?.reportType as 'bug' | 'change' | 'feedback') || 'bug'
  const reportTypeStyle = reportTypeColors[reportType] || reportTypeColors.bug

  const handleUpdate = async () => {
    setIsUpdating(true)
    const { error } = await supabase
      .from('bugs')
      .update({
        status,
        priority,
        assigned_to: assignedTo || null,
      })
      .eq('id', bug.id)

    setIsUpdating(false)
    if (!error) {
      router.refresh()
    }
  }

  const handleResolve = async () => {
    setIsUpdating(true)
    await supabase
      .from('bugs')
      .update({ status: 'resolved' })
      .eq('id', bug.id)

    setStatus('resolved')
    setIsUpdating(false)
    router.refresh()
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setIsCommenting(true)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('bug_comments')
      .insert({
        bug_id: bug.id,
        user_id: user?.id,
        content: comment,
      })

    setComment('')
    setIsCommenting(false)
    router.refresh()
  }

  const copyBugId = async () => {
    await navigator.clipboard.writeText(bug.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Build the fix prompt for Claude Code
  const buildFixPrompt = () => {
    const reportType = (bug.custom_metadata?.reportType as 'bug' | 'change' | 'feedback') || 'bug'
    const webhookUrl = 'https://bugradar.io/api/webhooks/claude-code'

    // Build elements section
    let elementsSection = ''
    if (bug.bug_elements && bug.bug_elements.length > 0) {
      elementsSection = `## Selected Elements
${bug.bug_elements.map((el: any, i: number) => {
  let elementInfo = `${i + 1}. **<${el.element_tag}>** element`
  if (el.element_text) elementInfo += `\n   - Text: "${el.element_text.slice(0, 100)}${el.element_text.length > 100 ? '...' : ''}"`
  if (el.element_selector) elementInfo += `\n   - Selector: \`${el.element_selector}\``
  if (el.annotation_note) elementInfo += `\n   - Note: ${el.annotation_note}`
  return elementInfo
}).join('\n\n')}

`
    }

    // Build screenshot section
    let screenshotSection = ''
    if (bug.screenshot_url) {
      screenshotSection = `## Screenshot - IMPORTANT: View This First!
A screenshot of the issue has been captured. **You MUST view this screenshot before starting work.**

**Screenshot URL:** ${bug.screenshot_url}

**Action Required:** Use the Read tool or WebFetch tool to view this image URL.

`
    }

    const typeConfig = {
      bug: { emoji: '🐛', header: 'Bug Fix Request', typeLabel: 'Bug Report', action: 'fix this bug' },
      feedback: { emoji: '💡', header: 'Feedback Implementation Request', typeLabel: 'Feedback / Suggestion', action: 'implement this feedback' },
      change: { emoji: '✏️', header: 'Edit / Change Request', typeLabel: 'Edit / Change Request', action: 'implement this change' }
    }
    const config = typeConfig[reportType]

    return `# ${config.emoji} BugRadar ${config.header}

## Request Details
- **ID:** ${bug.id}
- **Type:** ${config.typeLabel}
- **Title:** ${bug.title}
${bug.page_url ? `- **Page URL:** ${bug.page_url}` : ''}
${bug.projects?.name ? `- **Project:** ${bug.projects.name}` : ''}

## Description
${bug.description || bug.ai_enhanced_description || 'No description provided.'}

${screenshotSection}${elementsSection}${consoleErrors.length ? `## Console Errors
\`\`\`
${consoleErrors.slice(0, 10).join('\n')}
\`\`\`
` : ''}

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
When you complete the task, you MUST send a webhook:
\`\`\`bash
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bugId": "${bug.id}",
    "organizationId": "${organizationId}",
    "event": "fix_completed",
    "summary": "YOUR_SUMMARY_HERE",
    "filesChanged": ["file1.tsx"],
    "message": "Completed"
  }'
\`\`\`

Please ${config.action}.
`
  }

  // Direct Claude Fix - launches terminal immediately
  const handleDirectClaudeFix = async () => {
    if (!bug.projects?.local_path) {
      // If no project path, open the launcher modal instead
      setShowClaudeLauncher(true)
      return
    }

    setIsLaunchingClaude(true)
    try {
      // Update status to in_progress
      await supabase
        .from('bugs')
        .update({ status: 'in_progress', claude_fixing: true })
        .eq('id', bug.id)

      setStatus('in_progress')

      // Build the prompt
      const prompt = buildFixPrompt()

      // Launch the terminal with Claude
      const response = await fetch('/api/terminal/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath: bug.projects.local_path,
          bugId: bug.id,
          organizationId,
          webhookUrl: 'https://bugradar.io/api/webhooks/claude-code',
          prompt
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to launch Claude')
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to launch Claude:', error)
    } finally {
      setIsLaunchingClaude(false)
    }
  }

  // Build console errors from bug data
  const consoleErrors = bug.console_logs
    ?.filter((log: any) => log.type === 'error')
    ?.map((log: any) => log.message || log.args?.[0] || JSON.stringify(log))
    ?.slice(0, 10) || []

  // Check if Claude is currently fixing this bug
  const isClaudeFixing = bug.claude_fixing && status === 'in_progress'

  return (
    <div className="space-y-6">
      {/* Claude Fixing Banner */}
      {isClaudeFixing && (
        <div className="bg-gradient-to-r from-coral-500 to-coral-600 rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Claude is fixing this bug</p>
              <p className="text-sm text-white/80">
                Started {bug.claude_fix_started_at ? formatRelativeTime(bug.claude_fix_started_at) : 'just now'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <span className="text-sm text-white/90">Working...</span>
          </div>
        </div>
      )}

      {/* Claude Fix Summary - Show when bug was fixed by Claude */}
      {bug.claude_fix_summary && status === 'resolved' && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-green-800 dark:text-green-200">Fixed by Claude Code</h3>
                {bug.claude_fix_completed_at && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {formatRelativeTime(bug.claude_fix_completed_at)}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{bug.claude_fix_summary}</p>
              {bug.claude_fix_files && bug.claude_fix_files.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">Files Modified:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bug.claude_fix_files.map((file: string, idx: number) => (
                      <code key={idx} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-md font-mono">
                        {file}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/bugs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Actions
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', priorityStyle.bg, priorityStyle.text)}>
                      {priority}
                    </span>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusStyle.bg, statusStyle.text)}>
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                      {bug.source}
                    </span>
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {bug.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <button onClick={copyBugId} className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {bug.id.slice(0, 8)}
                    </button>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(bug.created_at)}
                    </span>
                    {bug.projects && (
                      <span className="flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5" />
                        {bug.projects.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {status !== 'resolved' && status !== 'closed' && (
                    <Button onClick={handleResolve} isLoading={isUpdating} className="whitespace-nowrap">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {(bug.description || bug.ai_enhanced_description) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Description
                  {bug.ai_enhanced_description && (
                    <span className="text-xs bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Enhanced
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                  {bug.ai_enhanced_description || bug.description}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Screenshot with Badge Overlay */}
          {bug.screenshot_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Screenshot
                  {bug.bug_elements && bug.bug_elements.length > 0 && (
                    <span className="text-xs bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 px-2 py-0.5 rounded-full">
                      {bug.bug_elements.length} element{bug.bug_elements.length !== 1 ? 's' : ''} marked
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScreenshotBadgeOverlay
                  src={bug.screenshot_url}
                  alt="Bug screenshot"
                  bugId={bug.id}
                  bugStatus={status}
                  bugPriority={priority}
                  bugTitle={bug.title}
                  elements={bug.bug_elements || []}
                  projectPath={bug.projects?.local_path}
                  onStatusChange={(newStatus) => {
                    setStatus(newStatus)
                    router.refresh()
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Environment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {bug.page_url && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">URL</p>
                    <a
                      href={bug.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral-600 dark:text-coral-400 hover:underline flex items-center gap-1 text-sm font-mono"
                    >
                      {bug.page_url.length > 50 ? `${bug.page_url.slice(0, 50)}...` : bug.page_url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                )}
                {bug.browser_name && (
                  <div className="space-y-1">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Browser</p>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {bug.browser_name} {bug.browser_version}
                    </p>
                  </div>
                )}
                {bug.os_name && (
                  <div className="space-y-1">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">OS</p>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {bug.os_name} {bug.os_version}
                    </p>
                  </div>
                )}
                {bug.device_type && (
                  <div className="space-y-1">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Device</p>
                    <p className="text-slate-900 dark:text-white font-medium capitalize">
                      {bug.device_type}
                    </p>
                  </div>
                )}
                {bug.screen_resolution && (
                  <div className="space-y-1">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Screen</p>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {bug.screen_resolution}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Console Logs */}
          {bug.console_logs && bug.console_logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Console Logs
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                    {bug.console_logs.filter((l: any) => l.type === 'error').length} errors
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg overflow-hidden">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Console Output</span>
                  </div>
                  <div className="p-4 font-mono text-xs text-slate-100 max-h-64 overflow-auto space-y-1">
                    {bug.console_logs.map((log: any, i: number) => (
                      <div key={i} className={cn(
                        'py-1 px-2 rounded',
                        log.type === 'error' && 'bg-red-500/10 text-red-400',
                        log.type === 'warn' && 'bg-yellow-500/10 text-yellow-400',
                        log.type === 'info' && 'text-blue-400',
                        log.type === 'log' && 'text-slate-300'
                      )}>
                        <span className="opacity-50">[{log.type}]</span> {log.message || JSON.stringify(log.args)}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  {bug.bug_comments?.length || 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="flex gap-3">
                <Input
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment} isLoading={isCommenting}>
                  Send
                </Button>
              </div>

              {/* Comments List */}
              {bug.bug_comments && bug.bug_comments.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {bug.bug_comments.map((c: any) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-white">
                          {c.users?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white text-sm">
                            {c.users?.full_name || 'User'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatRelativeTime(c.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          {bug.bug_activities && bug.bug_activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bug.bug_activities.slice(0, 10).map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="text-slate-600 dark:text-slate-300">
                        <span className="font-medium">{activity.users?.full_name || 'System'}</span>
                        {' '}{activity.activity_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {formatRelativeTime(activity.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bug Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-slate-500">Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                >
                  <option value="new">New</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="wont_fix">Won&apos;t Fix</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-slate-500">Priority</Label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-slate-500">Assignee</Label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.users?.full_name || member.users?.email}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleUpdate}
                className="w-full"
                isLoading={isUpdating}
                disabled={
                  status === bug.status &&
                  priority === bug.priority &&
                  assignedTo === (bug.assigned_to || '')
                }
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Created</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {formatDate(bug.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Updated</span>
                <span className="text-slate-900 dark:text-white">
                  {formatRelativeTime(bug.updated_at)}
                </span>
              </div>
              {bug.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Resolved</span>
                  <span className="text-green-600 dark:text-green-400">
                    {formatDate(bug.resolved_at)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Source</span>
                <span className="text-slate-900 dark:text-white capitalize">
                  {bug.source}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Selected Elements */}
          {bug.bug_elements && bug.bug_elements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bug.bug_elements.map((el: any, i: number) => (
                  <div key={el.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">
                        &lt;{el.element_tag}&gt;
                      </span>
                    </div>
                    {el.element_text && (
                      <p className="text-slate-500 dark:text-slate-400 truncate pl-7">
                        &quot;{el.element_text.slice(0, 50)}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Terminal Modal */}
      <AITerminal
        isOpen={showAITerminal}
        onClose={() => setShowAITerminal(false)}
        bugContext={{
          id: bug.id,
          title: bug.title,
          description: bug.description || bug.ai_enhanced_description,
          consoleErrors,
          pageUrl: bug.page_url,
          browserInfo: bug.browser_name ? `${bug.browser_name} ${bug.browser_version}` : undefined
        }}
        aiCreditsUsed={aiCreditsUsed}
        aiCreditsLimit={subscription?.ai_credits_limit || 10}
        onCreditsUsed={(amount) => setAiCreditsUsed(prev => prev + amount)}
      />

      {/* Claude Code Launcher Modal */}
      <ClaudeTerminalLauncher
        isOpen={showClaudeLauncher}
        onClose={() => setShowClaudeLauncher(false)}
        bugContext={{
          id: bug.id,
          title: bug.title,
          description: bug.description || bug.ai_enhanced_description,
          consoleErrors,
          pageUrl: bug.page_url,
          codebase: bug.projects?.name,
          projectId: bug.project_id,
          projectPath: bug.projects?.local_path,
          screenshotUrl: bug.screenshot_url,
          reportType: bug.custom_metadata?.reportType as 'bug' | 'feedback' | 'change' | undefined,
          elements: bug.bug_elements?.map((el: any) => ({
            selector: el.element_selector,
            tagName: el.element_tag,
            text: el.element_text,
            note: el.annotation_note,
          })) || []
        }}
        aiCreditsUsed={aiCreditsUsed}
        aiCreditsLimit={subscription?.ai_credits_limit || 10}
        organizationId={organizationId || ''}
        hasClaudeCodeAccess={hasClaudeCodeAccess}
      />
    </div>
  )
}
