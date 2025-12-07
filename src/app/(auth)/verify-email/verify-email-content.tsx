'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'

export function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  // Check if user is verified
  useEffect(() => {
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        router.push('/onboarding')
      }
    }

    // Poll for verification
    const interval = setInterval(checkVerification, 3000)
    return () => clearInterval(interval)
  }, [router, supabase.auth])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  async function handleResend() {
    setIsResending(true)
    setMessage(null)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    setIsResending(false)

    if (error) {
      setMessage('Failed to resend. Please try again.')
    } else {
      setMessage('Verification email sent!')
      setResendCooldown(60)
    }
  }

  // Determine email provider
  const getEmailProvider = () => {
    if (email.includes('gmail')) return { name: 'Gmail', url: 'https://mail.google.com' }
    if (email.includes('outlook') || email.includes('hotmail')) return { name: 'Outlook', url: 'https://outlook.live.com' }
    if (email.includes('yahoo')) return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' }
    return null
  }

  const emailProvider = getEmailProvider()

  return (
    <div className="space-y-6">
      <Link
        href="/signup"
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>

      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="rounded-full bg-coral-100 p-4 dark:bg-coral-900/30">
          <Mail className="h-10 w-10 text-coral-600 dark:text-coral-400 animate-pulse" />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Verify your email
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We sent a verification link to<br />
            <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
          </p>
        </div>
      </div>

      {/* Email provider quick link */}
      {emailProvider && (
        <a
          href={emailProvider.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          Open {emailProvider.name}
        </a>
      )}

      {message && (
        <p className="text-center text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}

      <div className="text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Didn&apos;t receive the email?
        </p>
        <Button
          variant="ghost"
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0}
          className="text-coral-600 dark:text-coral-400"
        >
          {isResending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            'Resend verification email'
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Wrong email?{' '}
        <Link href="/signup" className="text-coral-600 hover:underline dark:text-coral-400">
          Use a different email
        </Link>
      </p>
    </div>
  )
}
