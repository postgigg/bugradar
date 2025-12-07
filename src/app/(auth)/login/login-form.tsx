'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Sparkles } from 'lucide-react'

const DEMO_CREDENTIALS = {
  email: 'demo@bugradar.io',
  password: 'demo1234',
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'auth_callback_error'
      ? 'Authentication failed. Please try again.'
      : null
  )

  const supabase = createClient()

  async function handleLogin(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Check onboarding status and redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      router.push(profile?.onboarding_completed ? '/dashboard' : '/onboarding')
      router.refresh()
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await handleLogin(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setIsLoading(false)
    }
  }

  async function handleDemoLogin() {
    setIsDemoLoading(true)
    setError(null)

    try {
      await handleLogin(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed')
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Demo Login Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-2 border-dashed border-coral-300 dark:border-coral-700 hover:border-coral-500 hover:bg-coral-50 dark:hover:bg-coral-950/30 group"
        onClick={handleDemoLogin}
        disabled={isDemoLoading || isLoading}
        isLoading={isDemoLoading}
      >
        <Sparkles className="w-4 h-4 mr-2 text-coral-500 group-hover:animate-pulse" />
        <span className="text-coral-600 dark:text-coral-400">Try Demo Account</span>
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-coral-600 hover:text-coral-500 dark:text-coral-400"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading || isDemoLoading}>
          Sign in
        </Button>
      </form>

      {/* Demo credentials hint */}
      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">Demo credentials:</span>{' '}
          <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">demo@bugradar.io</code> /{' '}
          <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">demo1234</code>
        </p>
      </div>
    </div>
  )
}
