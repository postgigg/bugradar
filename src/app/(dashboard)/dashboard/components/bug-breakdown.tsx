'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface BreakdownItem {
  label: string
  count: number
  color: string
  percentage: number
}

export function BugBreakdown() {
  const [byPriority, setByPriority] = useState<BreakdownItem[]>([])
  const [byStatus, setByStatus] = useState<BreakdownItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchBreakdown() {
      try {
        // Get all bugs
        const { data: bugs } = await supabase
          .from('bugs')
          .select('priority, status')

        if (!bugs) return

        // Calculate priority breakdown
        const priorityCounts = bugs.reduce((acc, bug) => {
          acc[bug.priority] = (acc[bug.priority] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const total = bugs.length || 1
        setByPriority([
          { label: 'Critical', count: priorityCounts.critical || 0, color: 'bg-red-500', percentage: ((priorityCounts.critical || 0) / total) * 100 },
          { label: 'High', count: priorityCounts.high || 0, color: 'bg-orange-500', percentage: ((priorityCounts.high || 0) / total) * 100 },
          { label: 'Medium', count: priorityCounts.medium || 0, color: 'bg-amber-500', percentage: ((priorityCounts.medium || 0) / total) * 100 },
          { label: 'Low', count: priorityCounts.low || 0, color: 'bg-slate-400', percentage: ((priorityCounts.low || 0) / total) * 100 },
        ])

        // Calculate status breakdown
        const statusCounts = bugs.reduce((acc, bug) => {
          acc[bug.status] = (acc[bug.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        setByStatus([
          { label: 'Open', count: (statusCounts.new || 0) + (statusCounts.open || 0), color: 'bg-blue-500', percentage: (((statusCounts.new || 0) + (statusCounts.open || 0)) / total) * 100 },
          { label: 'In Progress', count: statusCounts.in_progress || 0, color: 'bg-amber-500', percentage: ((statusCounts.in_progress || 0) / total) * 100 },
          { label: 'Resolved', count: statusCounts.resolved || 0, color: 'bg-green-500', percentage: ((statusCounts.resolved || 0) / total) * 100 },
          { label: 'Closed', count: statusCounts.closed || 0, color: 'bg-slate-400', percentage: ((statusCounts.closed || 0) / total) * 100 },
        ])
      } catch (error) {
        console.error('Error fetching breakdown:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBreakdown()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Action Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* By Priority */}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            By Priority
          </p>
          <div className="space-y-2">
            {byPriority.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-20 text-xs text-slate-600 dark:text-slate-400">
                  {item.label}
                </div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', item.color)}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-8 text-xs text-right text-slate-600 dark:text-slate-400">
                  {loading ? '-' : item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Status */}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            By Status
          </p>
          <div className="space-y-2">
            {byStatus.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-20 text-xs text-slate-600 dark:text-slate-400">
                  {item.label}
                </div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', item.color)}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-8 text-xs text-right text-slate-600 dark:text-slate-400">
                  {loading ? '-' : item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
