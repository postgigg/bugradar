'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Loader2 } from 'lucide-react'

export function DemoButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleTryDemo() {
    setIsLoading(true)
    setError(null)

    try {
      // Create demo account
      const res = await fetch('/api/demo', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create demo account')
      }

      // Sign in with demo credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleTryDemo}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-white"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating demo account...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Try Demo — No signup required
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
      <p className="text-xs text-center text-slate-400">
        Get instant access with sample data
      </p>
    </div>
  )
}
