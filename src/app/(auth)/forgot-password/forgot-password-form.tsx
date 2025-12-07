'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Mail, CheckCircle } from 'lucide-react'

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Check your email
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We sent a reset link to<br />
              <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
            </p>
          </div>
        </div>

        {/* Email provider quick links */}
        <div className="flex justify-center gap-3">
          {email.includes('gmail') && (
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Open Gmail
            </a>
          )}
          {(email.includes('outlook') || email.includes('hotmail')) && (
            <a
              href="https://outlook.live.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Open Outlook
            </a>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Didn&apos;t receive the email?{' '}
          <button
            onClick={() => setSuccess(false)}
            className="font-medium text-coral-600 hover:text-coral-500 dark:text-coral-400"
          >
            Try again
          </button>
        </p>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Send reset link
      </Button>
    </form>
  )
}
