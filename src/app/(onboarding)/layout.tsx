import { Bug } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">BugRadar</span>
          </Link>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Setup your workspace
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
