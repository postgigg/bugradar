import Link from 'next/link'
import { Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">BugRadar</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Docs
              </Link>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
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
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">BugRadar</span>
              </Link>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                AI-powered bug tracking for vibe coders.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/features" className="hover:text-coral-500">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-coral-500">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-coral-500">Documentation</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/about" className="hover:text-coral-500">About</Link></li>
                <li><Link href="/blog" className="hover:text-coral-500">Blog</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/privacy" className="hover:text-coral-500">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-coral-500">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} BugRadar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
