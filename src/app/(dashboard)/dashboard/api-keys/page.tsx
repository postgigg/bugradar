import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Plus, Copy, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'API Keys | BugRadar',
  description: 'Manage your API keys',
}

export default async function ApiKeysPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Get user's projects
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user?.id)
    .limit(1)

  const organizationId = memberships?.[0]?.organization_id

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('organization_id', organizationId || '')

  const projectIds = projects?.map(p => p.id) || []

  // Get API keys for all projects
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select(`
      id, name, key_prefix, key_hint, environment, is_active, 
      last_used_at, created_at, projects(id, name)
    `)
    .in('project_id', projectIds.length > 0 ? projectIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })

  // Transform to flatten nested projects
  const keys = apiKeys?.map(key => ({
    ...key,
    projects: Array.isArray(key.projects) ? key.projects[0] || null : key.projects,
  }))

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            API Keys
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your SDK API keys
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Key
        </Button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-200">Keep your API keys secure</p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Never expose your API keys in client-side code or public repositories. Use environment variables.
          </p>
        </div>
      </div>

      {/* API Keys List */}
      {!keys || keys.length === 0 ? (
        <Card className="p-12 text-center">
          <Key className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 mb-1">No API keys yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
            Create an API key to start using the BugRadar SDK
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create your first key
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    key.environment === 'live' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    <Key className={`w-5 h-5 ${
                      key.environment === 'live' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-amber-600 dark:text-amber-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900 dark:text-white">{key.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        key.environment === 'live'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {key.environment}
                      </span>
                      {!key.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {key.projects?.name || 'Unknown project'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                        {key.key_prefix}...{key.key_hint}
                      </code>
                      <span className="text-xs text-slate-400">
                        {key.last_used_at 
                          ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
                          : 'Never used'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Usage Guide */}
      <Card className="p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Start</h2>
        <div className="bg-slate-900 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-slate-400 text-sm">app.tsx</span>
          </div>
          <div className="p-4 font-mono text-sm">
            <p className="text-coral-400">import {'{'} BugRadar {'}'} <span className="text-blue-400">from</span> <span className="text-green-400">'bugradar'</span>;</p>
            <p className="mt-2 text-slate-100">BugRadar.<span className="text-yellow-400">init</span>(<span className="text-green-400">'br_live_xxxxx'</span>);</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
