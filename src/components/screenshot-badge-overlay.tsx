'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Bug, AlertTriangle, Lightbulb, Edit3, X, Move,
  Maximize2, ChevronRight, CheckCircle, Clock, Loader2,
  Terminal, Sparkles, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface BugElement {
  id: string
  element_selector: string
  element_xpath: string
  element_tag: string
  element_text?: string
  bounding_box?: {
    x: number
    y: number
    width: number
    height: number
  }
  annotation_type?: string
  annotation_color?: string
  annotation_note?: string
  display_order: number
}

interface ScreenshotBadgeOverlayProps {
  src: string
  alt?: string
  bugId: string
  bugStatus: string
  bugPriority: string
  bugTitle: string
  elements: BugElement[]
  projectPath?: string
  onStatusChange?: (newStatus: string) => void
  onClaudeFix?: () => void
  className?: string
}

const priorityColors = {
  low: { bg: 'bg-slate-500', ring: 'ring-slate-300' },
  medium: { bg: 'bg-amber-500', ring: 'ring-amber-300' },
  high: { bg: 'bg-orange-500', ring: 'ring-orange-300' },
  critical: { bg: 'bg-red-500', ring: 'ring-red-300' },
}

const statusColors = {
  new: { bg: 'bg-blue-500', text: 'text-blue-600', label: 'New' },
  open: { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Open' },
  in_progress: { bg: 'bg-purple-500', text: 'text-purple-600', label: 'In Progress' },
  resolved: { bg: 'bg-green-500', text: 'text-green-600', label: 'Resolved' },
  closed: { bg: 'bg-slate-500', text: 'text-slate-600', label: 'Closed' },
}

export function ScreenshotBadgeOverlay({
  src,
  alt = 'Screenshot',
  bugId,
  bugStatus,
  bugPriority,
  bugTitle,
  elements,
  projectPath,
  onStatusChange,
  onClaudeFix,
  className,
}: ScreenshotBadgeOverlayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeElementId, setActiveElementId] = useState<string | null>(null)
  const [widgetPosition, setWidgetPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [status, setStatus] = useState(bugStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLaunchingClaude, setIsLaunchingClaude] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const supabase = createClient()

  // Real-time subscription for bug updates
  useEffect(() => {
    const channel = supabase
      .channel(`bug:${bugId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bugs',
          filter: `id=eq.${bugId}`,
        },
        (payload) => {
          const newStatus = payload.new.status
          if (newStatus !== status) {
            setStatus(newStatus)
            onStatusChange?.(newStatus)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bugId, status, onStatusChange, supabase])

  // Get image natural dimensions once loaded
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      })
      setImageLoaded(true)
    }
  }, [])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
    setImageLoaded(true)
  }

  // Widget drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if (!widgetRef.current) return
    e.preventDefault()
    setIsDragging(true)
    const rect = widgetRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y

      // Clamp to container bounds
      const maxX = containerRect.width - (widgetRef.current?.offsetWidth || 200)
      const maxY = containerRect.height - (widgetRef.current?.offsetHeight || 100)

      setWidgetPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      })
    },
    [isDragging, dragOffset]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('mouseup', handleDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleDrag)
        window.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, handleDrag, handleDragEnd])

  // Quick status update
  const handleQuickStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    const { error } = await supabase
      .from('bugs')
      .update({ status: newStatus })
      .eq('id', bugId)

    if (!error) {
      setStatus(newStatus)
      onStatusChange?.(newStatus)
    }
    setIsUpdating(false)
    setShowDeleteConfirm(false)
  }

  // Handle close/delete bug
  const handleCloseBug = async () => {
    await handleQuickStatusUpdate('closed')
  }

  // Build the fix prompt for Claude Code
  const buildFixPrompt = () => {
    const webhookUrl = 'https://bugradar.io/api/webhooks/claude-code'

    // Build elements section
    let elementsSection = ''
    if (elements && elements.length > 0) {
      elementsSection = `## Selected Elements
${elements.map((el, i) => {
  let elementInfo = `${i + 1}. **<${el.element_tag}>** element`
  if (el.element_text) elementInfo += `\n   - Text: "${el.element_text.slice(0, 100)}${el.element_text.length > 100 ? '...' : ''}"`
  if (el.element_selector) elementInfo += `\n   - Selector: \`${el.element_selector}\``
  if (el.annotation_note) elementInfo += `\n   - Note: ${el.annotation_note}`
  return elementInfo
}).join('\n\n')}

`
    }

    return `# 🐛 BugRadar Bug Fix Request

## Request Details
- **ID:** ${bugId}
- **Title:** ${bugTitle}

## Screenshot - IMPORTANT: View This First!
A screenshot of the issue has been captured. **You MUST view this screenshot before starting work.**

**Screenshot URL:** ${src}

**Action Required:** Use the Read tool or WebFetch tool to view this image URL.

${elementsSection}

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
    "bugId": "${bugId}",
    "event": "fix_completed",
    "summary": "YOUR_SUMMARY_HERE",
    "filesChanged": ["file1.tsx"],
    "message": "Completed"
  }'
\`\`\`

Please fix this bug.
`
  }

  // Launch Claude Code to fix the bug
  const handleClaudeFix = async () => {
    if (!projectPath) {
      // If no project path, call the callback if provided
      onClaudeFix?.()
      return
    }

    setIsLaunchingClaude(true)
    try {
      // First update status to in_progress
      await supabase
        .from('bugs')
        .update({ status: 'in_progress', claude_fixing: true })
        .eq('id', bugId)

      setStatus('in_progress')
      onStatusChange?.('in_progress')

      // Build the prompt
      const prompt = buildFixPrompt()

      // Launch the terminal with Claude
      const response = await fetch('/api/terminal/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath,
          bugId,
          webhookUrl: 'https://bugradar.io/api/webhooks/claude-code',
          prompt
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to launch Claude')
      }
    } catch (error) {
      console.error('Failed to launch Claude:', error)
    } finally {
      setIsLaunchingClaude(false)
    }
  }

  // Calculate badge position relative to displayed image
  const getBadgePosition = (element: BugElement) => {
    if (!element.bounding_box || !imageLoaded || !containerRef.current) {
      return null
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const imgElement = containerRef.current.querySelector('img')
    if (!imgElement) return null

    const imgRect = imgElement.getBoundingClientRect()

    // Scale factor between natural and displayed size
    const scaleX = imgRect.width / imageDimensions.width
    const scaleY = imgRect.height / imageDimensions.height

    // Calculate position relative to the image within container
    const offsetX = imgRect.left - containerRect.left
    const offsetY = imgRect.top - containerRect.top

    return {
      left: offsetX + element.bounding_box.x * scaleX,
      top: offsetY + element.bounding_box.y * scaleY,
      width: element.bounding_box.width * scaleX,
      height: element.bounding_box.height * scaleY,
    }
  }

  const priorityStyle = priorityColors[bugPriority as keyof typeof priorityColors] || priorityColors.medium
  const statusStyle = statusColors[status as keyof typeof statusColors] || statusColors.open

  // Only show overlay for active bugs
  const showOverlay = ['new', 'open', 'in_progress'].includes(status)

  return (
    <div className={cn('relative', className)}>
      {/* Main Screenshot Container */}
      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
      >
        {/* Screenshot Image */}
        <Image
          ref={imgRef as any}
          src={src}
          alt={alt}
          width={800}
          height={600}
          className="w-full h-auto"
          onLoad={handleImageLoad}
        />

        {/* Badge Overlays on Elements */}
        {showOverlay && imageLoaded && elements.map((element, index) => {
          const position = getBadgePosition(element)
          if (!position) return null

          const isActive = activeElementId === element.id
          const annotationType = element.annotation_type || 'bug'

          return (
            <div key={element.id}>
              {/* Element highlight box */}
              <div
                className={cn(
                  'absolute border-2 rounded transition-all duration-200 pointer-events-none',
                  isActive ? 'border-coral-500 bg-coral-500/10' : 'border-transparent'
                )}
                style={{
                  left: position.left,
                  top: position.top,
                  width: position.width,
                  height: position.height,
                }}
              />

              {/* Badge */}
              <button
                onClick={() => setActiveElementId(isActive ? null : element.id)}
                className={cn(
                  'absolute z-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-200',
                  'w-7 h-7 text-white font-bold text-xs',
                  isActive ? 'scale-125 ring-4' : 'hover:scale-110',
                  priorityStyle.bg,
                  isActive && priorityStyle.ring
                )}
                style={{
                  left: position.left + position.width - 14,
                  top: position.top - 7,
                }}
              >
                {index + 1}
              </button>

              {/* Element Action Popup */}
              {isActive && (
                <div
                  className="absolute z-20 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 min-w-[240px] animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    left: Math.min(position.left, (containerRef.current?.offsetWidth || 400) - 260),
                    top: position.top + position.height + 8,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {annotationType === 'bug' && <Bug className="w-4 h-4 text-red-500" />}
                      {annotationType === 'issue' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {annotationType === 'suggestion' && <Lightbulb className="w-4 h-4 text-blue-500" />}
                      {annotationType === 'edit' && <Edit3 className="w-4 h-4 text-purple-500" />}
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {annotationType}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveElementId(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    {`<${element.element_tag}>`}
                  </p>

                  {element.element_text && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                      &quot;{element.element_text.slice(0, 80)}&quot;
                    </p>
                  )}

                  {element.annotation_note && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded p-2 mb-2">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {element.annotation_note}
                      </p>
                    </div>
                  )}

                  <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block truncate">
                    {element.element_selector}
                  </code>
                </div>
              )}
            </div>
          )
        })}

        {/* Draggable Action Widget */}
        {showOverlay && (
          <div
            ref={widgetRef}
            className={cn(
              'absolute z-30 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700',
              'min-w-[200px] select-none',
              isDragging && 'cursor-grabbing'
            )}
            style={{
              left: widgetPosition.x,
              top: widgetPosition.y,
            }}
          >
            {/* Drag Handle */}
            <div
              onMouseDown={handleDragStart}
              className={cn(
                'flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-t-xl cursor-grab',
                'border-b border-slate-200 dark:border-slate-600',
                isDragging && 'cursor-grabbing'
              )}
            >
              <div className="flex items-center gap-2">
                <Move className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Bug Actions
                </span>
              </div>
              {/* Delete/Close Button */}
              {status !== 'closed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(true)
                  }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                  title="Close bug"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Widget Content */}
            <div className="p-3 space-y-3">
              {/* Delete Confirmation */}
              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-500">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Close this bug?</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    This will move the bug to closed status.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8 bg-red-600 hover:bg-red-700"
                      onClick={handleCloseBug}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Close Bug'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      statusStyle.bg,
                      'text-white'
                    )}>
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-1.5">
                    {status !== 'in_progress' && status !== 'resolved' && status !== 'closed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-between text-xs h-8"
                        onClick={() => handleQuickStatusUpdate('in_progress')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              Start Working
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </>
                        )}
                      </Button>
                    )}

                    {status !== 'resolved' && status !== 'closed' && (
                      <Button
                        size="sm"
                        className="w-full justify-between text-xs h-8 bg-green-600 hover:bg-green-700"
                        onClick={() => handleQuickStatusUpdate('resolved')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3" />
                              Mark Resolved
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </>
                        )}
                      </Button>
                    )}

                    {/* Claude Fix Button */}
                    {status !== 'resolved' && status !== 'closed' && (projectPath || onClaudeFix) && (
                      <Button
                        size="sm"
                        className="w-full justify-between text-xs h-8 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700"
                        onClick={handleClaudeFix}
                        disabled={isLaunchingClaude}
                      >
                        {isLaunchingClaude ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              Claude Fix It
                            </span>
                            <Terminal className="w-3 h-3" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Elements Count */}
                  {elements.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {elements.length} element{elements.length !== 1 ? 's' : ''} highlighted
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors"
        >
          <Maximize2 className="w-3 h-3" />
          Expand
        </button>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-full max-h-full">
            <Image
              src={src}
              alt={alt}
              width={1920}
              height={1080}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
