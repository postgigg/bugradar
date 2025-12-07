'use client'

import { useEffect, useState } from 'react'
import { Bug, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Stat {
  name: string
  value: number
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([
    { name: 'Open Actions', value: 0, change: 0, changeType: 'neutral', icon: Bug, color: 'coral' },
    { name: 'Resolved Today', value: 0, change: 0, changeType: 'positive', icon: CheckCircle, color: 'green' },
    { name: 'Critical', value: 0, change: 0, changeType: 'negative', icon: AlertTriangle, color: 'red' },
    { name: 'Avg. Resolution', value: 0, change: 0, changeType: 'neutral', icon: Clock, color: 'blue' },
  ])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get open bugs count
        const { count: openBugs } = await supabase
          .from('bugs')
          .select('*', { count: 'exact', head: true })
          .in('status', ['new', 'open', 'in_progress'])

        // Get resolved today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count: resolvedToday } = await supabase
          .from('bugs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved')
          .gte('resolved_at', today.toISOString())

        // Get critical bugs
        const { count: criticalBugs } = await supabase
          .from('bugs')
          .select('*', { count: 'exact', head: true })
          .eq('priority', 'critical')
          .in('status', ['new', 'open', 'in_progress'])

        setStats([
          { name: 'Open Actions', value: openBugs || 0, change: 12, changeType: 'negative', icon: Bug, color: 'coral' },
          { name: 'Resolved Today', value: resolvedToday || 0, change: 8, changeType: 'positive', icon: CheckCircle, color: 'green' },
          { name: 'Critical', value: criticalBugs || 0, change: 2, changeType: 'negative', icon: AlertTriangle, color: 'red' },
          { name: 'Avg. Resolution', value: 4.2, change: -15, changeType: 'positive', icon: Clock, color: 'blue' },
        ])
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const colorClasses = {
    coral: 'bg-coral-100 text-coral-600 dark:bg-coral-900/30 dark:text-coral-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6">
          <div className="flex items-center justify-between">
            <div className={cn('p-2 rounded-lg', colorClasses[stat.color as keyof typeof colorClasses])}>
              <stat.icon className="w-5 h-5" />
            </div>
            {stat.change !== 0 && (
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                stat.changeType === 'positive' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                stat.changeType === 'negative' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                stat.changeType === 'neutral' && 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              )}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {loading ? '...' : stat.name === 'Avg. Resolution' ? `${stat.value}h` : stat.value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stat.name}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
