'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Terminal, Sparkles, Copy, Check, Loader2, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AITerminalProps {
  isOpen: boolean
  onClose: () => void
  bugContext: {
    id: string
    title: string
    description?: string
    consoleErrors?: string[]
    stackTrace?: string
    pageUrl?: string
    browserInfo?: string
  }
  aiCreditsUsed: number
  aiCreditsLimit: number
  onCreditsUsed?: (amount: number) => void
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  'Analyze this bug and suggest a fix',
  'What are the possible causes of this error?',
  'Generate a code fix for this issue',
  'Explain this error in simple terms',
]

export function AITerminal({ isOpen, onClose, bugContext, aiCreditsUsed, aiCreditsLimit, onCreditsUsed }: AITerminalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showContext, setShowContext] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const creditsRemaining = aiCreditsLimit - aiCreditsUsed
  const creditsPercentUsed = (aiCreditsUsed / aiCreditsLimit) * 100

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      // Add initial system context message
      if (messages.length === 0) {
        setMessages([{
          id: 'system-1',
          role: 'system',
          content: `🔍 Analyzing bug: "${bugContext.title}"`,
          timestamp: new Date()
        }])
      }
    }
  }, [isOpen, bugContext.title, messages.length])

  const buildContext = useCallback(() => {
    let context = `Bug Report Context:
Title: ${bugContext.title}
${bugContext.description ? `Description: ${bugContext.description}` : ''}
${bugContext.pageUrl ? `URL: ${bugContext.pageUrl}` : ''}
${bugContext.browserInfo ? `Browser: ${bugContext.browserInfo}` : ''}`

    if (bugContext.consoleErrors?.length) {
      context += `\n\nConsole Errors:\n${bugContext.consoleErrors.slice(0, 5).join('\n')}`
    }

    if (bugContext.stackTrace) {
      context += `\n\nStack Trace:\n${bugContext.stackTrace.slice(0, 1000)}`
    }

    return context
  }, [bugContext])

  const handleSubmit = async (promptText?: string) => {
    const userMessage = promptText || input.trim()
    if (!userMessage || isLoading) return
    if (creditsRemaining <= 0) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'system',
        content: '⚠️ You have no AI credits remaining. Please upgrade your plan to continue using AI features.',
        timestamp: new Date()
      }])
      return
    }

    setInput('')
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      // Call AI API
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          context: buildContext(),
          bugId: bugContext.id
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMsg])

      // Track credit usage
      if (onCreditsUsed) {
        onCreditsUsed(1)
      }
    } catch (error) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl h-[80vh] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Claude AI Assistant</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Ready</span>
            </div>
          </div>

          {/* Credits indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className={cn(
                'w-4 h-4',
                creditsRemaining > 5 ? 'text-emerald-400' : creditsRemaining > 0 ? 'text-amber-400' : 'text-red-400'
              )} />
              <span className="text-xs text-slate-400">
                <span className={cn(
                  'font-medium',
                  creditsRemaining > 5 ? 'text-emerald-400' : creditsRemaining > 0 ? 'text-amber-400' : 'text-red-400'
                )}>
                  {creditsRemaining}
                </span>
                /{aiCreditsLimit} credits
              </span>
              <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    creditsPercentUsed < 50 ? 'bg-emerald-500' :
                    creditsPercentUsed < 80 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  style={{ width: `${100 - creditsPercentUsed}%` }}
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Context Panel (collapsible) */}
        <div className="border-b border-slate-700 bg-slate-800/50">
          <button
            onClick={() => setShowContext(!showContext)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral-500 animate-pulse" />
              Bug Context: {bugContext.title.slice(0, 50)}{bugContext.title.length > 50 ? '...' : ''}
            </span>
            {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showContext && (
            <div className="px-4 pb-3 text-xs font-mono text-slate-400 space-y-1 max-h-32 overflow-auto">
              <p><span className="text-slate-500">Title:</span> {bugContext.title}</p>
              {bugContext.description && <p><span className="text-slate-500">Description:</span> {bugContext.description.slice(0, 200)}</p>}
              {bugContext.pageUrl && <p><span className="text-slate-500">URL:</span> {bugContext.pageUrl}</p>}
              {bugContext.consoleErrors?.length ? (
                <p><span className="text-red-400">Errors:</span> {bugContext.consoleErrors.length} console error(s)</p>
              ) : null}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' && 'justify-end'
              )}
            >
              {msg.role !== 'user' && (
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  msg.role === 'assistant' ? 'bg-gradient-to-br from-coral-500 to-coral-600' : 'bg-slate-700'
                )}>
                  {msg.role === 'assistant' ? (
                    <Sparkles className="w-4 h-4 text-white" />
                  ) : (
                    <Terminal className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-lg p-3',
                msg.role === 'user'
                  ? 'bg-coral-500 text-white'
                  : msg.role === 'assistant'
                  ? 'bg-slate-800 text-slate-100'
                  : 'bg-slate-700/50 text-slate-300 text-sm'
              )}>
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="mt-2 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copied === msg.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy response
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-coral-400" />
                <span className="text-sm text-slate-300">Analyzing...</span>
              </div>
            </div>
          )}

          {messages.length === 1 && !isLoading && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Suggested prompts</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSubmit(prompt)}
                    className="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Claude about this bug..."
                disabled={isLoading || creditsRemaining <= 0}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Enter</kbd>
              </div>
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading || creditsRemaining <= 0}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2',
                input.trim() && !isLoading && creditsRemaining > 0
                  ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:from-coral-600 hover:to-coral-700'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500 text-center">
            Each AI analysis uses 1 credit. <span className="text-coral-400 hover:underline cursor-pointer">Upgrade for more</span>
          </p>
        </div>
      </div>
    </div>
  )
}
