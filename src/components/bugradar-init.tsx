'use client'

import { useEffect, useState } from 'react'

export function BugRadarInit() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Dynamic import to avoid SSR issues
    import('bugradar').then(({ BugRadar }) => {
      BugRadar.init({
        apiKey: 'br_live_5f0d2f06696c2a1553ac74c89f4211a7',
        apiUrl: 'http://localhost:3000/api/v1',
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
