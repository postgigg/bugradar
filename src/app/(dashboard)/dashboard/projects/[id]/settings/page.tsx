import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiKeysManager } from '@/components/project/api-keys-manager'
import { LocalPathEditor } from '@/components/project/local-path-editor'
import {
  Settings, Globe, Code, Trash2,
  ArrowLeft, Shield
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Project Settings | BugRadar',
  description: 'Configure your project settings',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectSettingsPage({ params }: Props) {
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

  // Get API keys for this project
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, key_hint, environment, is_active, last_used_at')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/projects/${id}`}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Project Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure settings for {project.name}
          </p>
        </div>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">General</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Basic project information</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" defaultValue={project.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Project Slug</Label>
            <Input id="slug" defaultValue={project.slug} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" defaultValue={project.description || ''} placeholder="Optional project description" />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </Card>

      {/* Platform Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Platform</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Platform and framework settings</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <select
              id="platform"
              defaultValue={project.platform || 'web'}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg"
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Input id="framework" defaultValue={project.framework || ''} placeholder="e.g., React, Next.js, Vue" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="domain">Domain</Label>
            <Input id="domain" defaultValue={project.domain || ''} placeholder="e.g., app.example.com" />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </Card>

      {/* Claude Code Integration */}
      <LocalPathEditor projectId={id} initialPath={project.local_path} />

      {/* API Keys */}
      <ApiKeysManager projectId={id} initialKeys={apiKeys || []} />

      {/* SDK Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-coral-600 dark:text-coral-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">SDK Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure SDK behavior</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">AI Enhancement</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Auto-enhance bug descriptions with AI</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={project.settings?.ai_enhance_enabled !== false} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coral-300 dark:peer-focus:ring-coral-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-coral-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Screenshot Capture</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Allow screenshot capture in bug reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={project.settings?.screenshot_enabled !== false} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coral-300 dark:peer-focus:ring-coral-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-coral-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Console Logs</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Capture console logs with bug reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={project.settings?.console_logs_enabled !== false} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coral-300 dark:peer-focus:ring-coral-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-coral-500"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 dark:border-red-900/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Danger Zone</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Irreversible actions</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Delete Project</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete this project and all its actions</p>
          </div>
          <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </Card>
    </div>
  )
}
