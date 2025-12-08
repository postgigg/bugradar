'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButterflyHelpProps {
  id: string
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

// Butterfly SVG icon
function ButterflyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("w-6 h-6", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 12C12 12 8 8 4 10C0 12 2 18 6 18C10 18 12 14 12 12Z"
        fill="currentColor"
        className="text-coral-400"
      />
      <path
        d="M12 12C12 12 16 8 20 10C24 12 22 18 18 18C14 18 12 14 12 12Z"
        fill="currentColor"
        className="text-coral-500"
      />
      <path
        d="M12 12C12 12 9 6 6 4C3 2 1 6 4 8C7 10 12 12 12 12Z"
        fill="currentColor"
        className="text-amber-400"
      />
      <path
        d="M12 12C12 12 15 6 18 4C21 2 23 6 20 8C17 10 12 12 12 12Z"
        fill="currentColor"
        className="text-amber-500"
      />
      <ellipse cx="12" cy="14" rx="1" ry="4" fill="currentColor" className="text-slate-700" />
      <circle cx="12" cy="9" r="1.5" fill="currentColor" className="text-slate-700" />
    </svg>
  )
}

export function ButterflyHelp({ id, title, content, position = 'right', className }: ButterflyHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isRookie, setIsRookie] = useState(false)

  useEffect(() => {
    // Check if user is a rookie from localStorage or user context
    const skillLevel = localStorage.getItem('bugradar_skill_level')
    setIsRookie(skillLevel === 'rookie')

    // Check if this specific help was dismissed
    const dismissedHelps = JSON.parse(localStorage.getItem('bugradar_dismissed_helps') || '[]')
    setDismissed(dismissedHelps.includes(id))
  }, [id])

  const handleDismiss = () => {
    const dismissedHelps = JSON.parse(localStorage.getItem('bugradar_dismissed_helps') || '[]')
    dismissedHelps.push(id)
    localStorage.setItem('bugradar_dismissed_helps', JSON.stringify(dismissedHelps))
    setDismissed(true)
    setIsOpen(false)
  }

  // Don't show for pro users or if dismissed
  if (!isRookie || dismissed) return null

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white dark:border-t-slate-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white dark:border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white dark:border-l-slate-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white dark:border-r-slate-800',
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-1.5 rounded-full transition-all duration-300 hover:scale-110",
          "bg-gradient-to-br from-coral-100 to-amber-100 dark:from-coral-900/30 dark:to-amber-900/30",
          "hover:from-coral-200 hover:to-amber-200 dark:hover:from-coral-800/40 dark:hover:to-amber-800/40",
          "shadow-sm hover:shadow-md",
          "animate-pulse-slow"
        )}
        aria-label="Help"
      >
        <ButterflyIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <div
            className={cn(
              "absolute z-50 w-72 p-4 rounded-xl shadow-xl",
              "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              "animate-fade-in",
              positionClasses[position]
            )}
          >
            {/* Arrow */}
            <div className={cn("absolute w-0 h-0 border-8", arrowClasses[position])} />

            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <ButterflyIcon className="w-5 h-5" />
                <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {content}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Don&apos;t show again
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs font-medium bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Hook to check if user is rookie
export function useIsRookie() {
  const [isRookie, setIsRookie] = useState(false)

  useEffect(() => {
    const skillLevel = localStorage.getItem('bugradar_skill_level')
    setIsRookie(skillLevel === 'rookie')
  }, [])

  return isRookie
}

// Helper to set skill level
export function setSkillLevel(level: 'rookie' | 'pro') {
  localStorage.setItem('bugradar_skill_level', level)
}
