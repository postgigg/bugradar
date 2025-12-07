import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Settings, Bug, Key, Copy,
  Globe, Code, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Project | BugRadar',
  description: 'View project details',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  // Get bug counts
  const { count: totalBugs } = await supabase
    .from('bugs')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  const { count: openBugs } = await supabase
    .from('bugs')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)
    .in('status', ['new', 'open', 'in_progress'])

  const { count: resolvedBugs } = await supabase
    .from('bugs')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)
    .eq('status', 'resolved')

  // Get API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, key_hint, environment, is_active')
    .eq('project_id', id)
    .limit(3)

  // Get recent bugs
  const { data: recentBugs } = await supabase
    .from('bugs')
    .select('id, title, status, priority, created_at')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/projects"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {project.name}
              </h1>
              <span className={`text-xs px-2 py-1 rounded-full ${
                project.is_active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {project.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {project.platform} • {project.framework || 'No framework'}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/projects/${id}/settings`}>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalBugs || 0}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Actions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{openBugs || 0}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Open Actions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{resolvedBugs || 0}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Resolved</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Setup */}
        <Card className="p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Quick Setup
          </h2>
          <div className="bg-slate-900 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-slate-400 text-sm">app.tsx</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-1">
              <p><span className="text-coral-400">import</span> <span className="text-white">{'{ BugRadar }'}</span> <span className="text-coral-400">from</span> <span className="text-green-400">&apos;bugradar&apos;</span><span className="text-white">;</span></p>
              <p className="mt-3"><span className="text-white">BugRadar</span><span className="text-slate-400">.</span><span className="text-yellow-400">init</span><span className="text-white">(</span><span className="text-green-400">&apos;br_live_xxxxx&apos;</span><span className="text-white">);</span></p>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Replace <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">br_live_xxxxx</code> with your API key
          </p>
        </Card>

        {/* API Keys */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </h2>
            <Link href={`/dashboard/projects/${id}/settings`}>
              <Button variant="ghost" size="sm">Manage</Button>
            </Link>
          </div>

          {!apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Key className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No API keys yet</p>
              <Link href={`/dashboard/projects/${id}/settings`}>
                <Button size="sm" className="mt-3">Create Key</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${key.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <code className="text-sm text-slate-600 dark:text-slate-400">
                      {key.key_prefix}...{key.key_hint}
                    </code>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      key.environment === 'live'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {key.environment}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Bugs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Recent Actions
          </h2>
          <Link href={`/dashboard/bugs?project=${id}`}>
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {!recentBugs || recentBugs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <Bug className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No actions reported yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Actions will appear here once users start reporting
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {recentBugs.map((bug) => (
              <Link
                key={bug.id}
                href={`/dashboard/bugs/${bug.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    bug.priority === 'critical' ? 'bg-red-500' :
                    bug.priority === 'high' ? 'bg-orange-500' :
                    bug.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-slate-400'
                  }`} />
                  <span className="text-slate-900 dark:text-white">{bug.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    bug.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    bug.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    bug.status === 'in_progress' ? 'bg-coral-100 text-coral-700 dark:bg-coral-900/30 dark:text-coral-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {bug.status.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(bug.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
