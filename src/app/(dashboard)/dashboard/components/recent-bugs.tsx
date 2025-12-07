'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { priorityColors, statusColors } from '@/lib/brand'

interface Bug {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
  page_url: string
  projects: { name: string } | null
}

interface RecentBugsProps {
  bugs: Bug[]
}

export function RecentBugs({ bugs }: RecentBugsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Actions</CardTitle>
        <Link href="/dashboard/bugs">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {bugs.length === 0 ? (
          <div className="text-center py-8">
            <Bug className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No actions yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Actions will appear here once reported
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bugs.map((bug) => {
              const priority = priorityColors[bug.priority as keyof typeof priorityColors] || priorityColors.medium
              const status = statusColors[bug.status as keyof typeof statusColors] || statusColors.open

              return (
                <Link
                  key={bug.id}
                  href={`/dashboard/bugs/${bug.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className={cn('w-2 h-2 mt-2 rounded-full flex-shrink-0', priority.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-coral-600 dark:group-hover:text-coral-400">
                      {bug.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', status.bg, status.text)}>
                        {bug.status.replace('_', ' ')}
                      </span>
                      {bug.projects && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {bug.projects.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(bug.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
