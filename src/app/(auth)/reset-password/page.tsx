import { Metadata } from 'next'
import { ResetPasswordForm } from './reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password | BugRadar',
  description: 'Set your new password',
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Create new password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your new password below
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  )
}
