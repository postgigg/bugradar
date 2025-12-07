import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from './signup-form'
import { OAuthButtons, AuthDivider } from '@/components/auth'
import { DemoButton } from './demo-button'

export const metadata: Metadata = {
  title: 'Sign Up | BugRadar',
  description: 'Create your BugRadar account',
}

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Create your account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Start tracking bugs in minutes
        </p>
      </div>

      <DemoButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
            or create an account
          </span>
        </div>
      </div>

      <OAuthButtons />
      <AuthDivider />
      <SignupForm />

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-coral-600 hover:text-coral-500 dark:text-coral-400"
        >
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
