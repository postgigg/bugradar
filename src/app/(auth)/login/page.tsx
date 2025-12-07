import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from './login-form'
import { OAuthButtons, AuthDivider } from '@/components/auth'

export const metadata: Metadata = {
  title: 'Login | BugRadar',
  description: 'Sign in to your BugRadar account',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign in to your account to continue
        </p>
      </div>

      <OAuthButtons />
      <AuthDivider />
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading...</div>}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-coral-600 hover:text-coral-500 dark:text-coral-400"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
