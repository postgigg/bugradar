'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Check, X, CheckCircle } from 'lucide-react'

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!isPasswordValid) {
      setError('Please choose a stronger password')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Password updated!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Redirecting to login...
          </p>
        </div>
      </div>
    )
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
        <Label htmlFor="password">New password</Label>
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword.length > 0 && !passwordsMatch}
        />
        {confirmPassword.length > 0 && (
          <p className={`text-xs ${passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {passwordsMatch ? (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Passwords match
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <X className="h-3 w-3" /> Passwords do not match
              </span>
            )}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={!isPasswordValid || !passwordsMatch}
      >
        Update password
      </Button>
    </form>
  )
}
