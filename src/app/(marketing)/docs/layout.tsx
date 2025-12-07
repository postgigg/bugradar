import Link from 'next/link'
import { Bug, Github, Twitter } from 'lucide-react'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { Button } from '@/components/ui/button'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white">BugRadar</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <Link href="/docs">
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                    Docs
                  </Button>
                </Link>
                <Link href="/#features">
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                    Features
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                    Pricing
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <DocsSidebar />

            {/* Content */}
            <main className="flex-1 min-w-0">
              <div className="max-w-3xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">BugRadar</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/bugradar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/bugradar/sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} BugRadar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
