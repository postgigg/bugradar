'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Download,
  Settings,
  Code2,
  FileCode,
  AlertCircle,
  ChevronRight
} from 'lucide-react'

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs', icon: BookOpen },
      { title: 'Installation', href: '/docs/installation', icon: Download },
      { title: 'Configuration', href: '/docs/configuration', icon: Settings },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'API Reference', href: '/docs/api-reference', icon: Code2 },
      { title: 'Examples', href: '/docs/examples', icon: FileCode },
    ],
  },
  {
    title: 'Help',
    items: [
      { title: 'Troubleshooting', href: '/docs/troubleshooting', icon: AlertCircle },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pr-4">
        <nav className="space-y-8">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-coral-500' : ''}`} />
                        <span className="flex-1">{item.title}</span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-coral-500" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/bugradar/sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors"
              >
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://npmjs.com/package/bugradar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors"
              >
                NPM Package
              </a>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
