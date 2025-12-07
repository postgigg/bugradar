'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Check, X } from 'lucide-react'

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  const supabase = createClient()

  // Password strength checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length
  const isPasswordValid = passwordStrength >= 3

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!isPasswordValid) {
      setError('Please choose a stronger password')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // Redirect to verify email page
    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          required
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Password strength indicator */}
        {password && (
          <div className="space-y-2 mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    passwordStrength >= level
                      ? passwordStrength <= 1
                        ? 'bg-red-500'
                        : passwordStrength <= 2
                        ? 'bg-amber-500'
                        : passwordStrength <= 3
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <ul className="grid grid-cols-2 gap-1 text-xs">
              {[
                { key: 'length', label: '8+ characters' },
                { key: 'uppercase', label: 'Uppercase' },
                { key: 'lowercase', label: 'Lowercase' },
                { key: 'number', label: 'Number' },
              ].map(({ key, label }) => (
                <li
                  key={key}
                  className={`flex items-center gap-1 ${
                    passwordChecks[key as keyof typeof passwordChecks]
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {passwordChecks[key as keyof typeof passwordChecks] ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create account
      </Button>
    </form>
  )
}
