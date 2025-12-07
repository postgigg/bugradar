import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from './forgot-password-form'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Forgot Password | BugRadar',
  description: 'Reset your BugRadar password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Reset your password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
