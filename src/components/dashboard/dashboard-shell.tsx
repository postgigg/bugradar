'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bug, Home, FolderKanban, Users, Settings,
  CreditCard, Key, ChevronLeft, ChevronRight,
  Menu, X, Bell, Search, LogOut, Moon, Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DashboardShellProps {
  children: React.ReactNode
  user: any
  organization: any
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Actions', href: '/dashboard/bugs', icon: Bug },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Team', href: '/dashboard/team', icon: Users },
]

const secondaryNav = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
]

export function DashboardShell({ children, user, organization }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Initialize dark mode state on mount - sync with system preference or existing class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches

    setDarkMode(isDark)

    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bug className="w-5 h-5 text-white" />
            </div>
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Organization */}
        {!sidebarCollapsed && organization && (
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Workspace
            </p>
            <p className="font-medium text-slate-900 dark:text-white truncate">
              {organization.name}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-coral-50 text-coral-600 dark:bg-coral-900/20 dark:text-coral-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-coral-500')} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-coral-50 text-coral-600 dark:bg-coral-900/20 dark:text-coral-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
            <div className="w-8 h-8 rounded-full bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-coral-600 dark:text-coral-400">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs text-slate-400 bg-slate-200 dark:bg-slate-600 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </button>

              <button className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-500 rounded-full" />
              </button>

              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
