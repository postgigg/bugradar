'use client'

import { useEffect, useState } from 'react'

export function BugRadarInit() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Determine API URL based on environment
    const apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.origin}/api/v1`
      : 'http://localhost:3000/api/v1'

    // Dynamic import to avoid SSR issues
    import('bugradar').then(({ BugRadar }) => {
      BugRadar.init({
        apiKey: 'br_live_b534ff163f468431bb4ea15cfbb2ef2a',
        apiUrl,
        position: 'bottom-right',
        theme: 'auto',
      })

      // Expose BugRadar globally for testing bug overlays
      ;(window as any).BugRadar = BugRadar

      // Auto-initialize bug overlays after a short delay
      // This fetches bugs for current page and shows badges on elements
      const timer = setTimeout(() => {
        BugRadar.initBugOverlays().catch(err => {
          console.log('[BugRadar] Bug overlay init:', err.message || 'No bugs for this page')
        })
      }, 1500)

      // Store cleanup ref
      ;(window as any).__bugradarCleanup = () => {
        clearTimeout(timer)
        BugRadar.destroy()
      }
    })

    return () => {
      if ((window as any).__bugradarCleanup) {
        (window as any).__bugradarCleanup()
      }
    }
  }, [mounted])

  return null
}
