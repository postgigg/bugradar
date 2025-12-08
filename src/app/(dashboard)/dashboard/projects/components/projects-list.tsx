'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import {
  FolderKanban, Plus, Monitor, Smartphone,
  MonitorSmartphone, Bug, Key, Settings, X, FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { ButterflyHelp } from '@/components/ui/butterfly-help'

interface Project {
  id: string
  name: string
  slug: string
  platform: string
  framework: string | null
  local_path: string | null
  created_at: string
  is_active: boolean
  bugs: { count: number }[]
  api_keys: { count: number }[]
}

interface ProjectsListProps {
  projects: Project[]
  canManage: boolean
}

const platformIcons = {
  web: Monitor,
  mobile: Smartphone,
  desktop: MonitorSmartphone,
}

export function ProjectsList({ projects, canManage }: ProjectsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showCreate, setShowCreate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState<'web' | 'mobile' | 'desktop'>('web')
  const [localPath, setLocalPath] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsCreating(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user?.id)
      .single()

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    await supabase.from('projects').insert({
      organization_id: membership?.organization_id,
      name,
      slug,
      platform,
      local_path: localPath || null,
    })

    setIsCreating(false)
    setShowCreate(false)
    setName('')
    setLocalPath('')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Create Modal */}
      {showCreate && (
        <Card className="p-6 border-coral-200 dark:border-coral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Create Project</h3>
            <button onClick={() => setShowCreate(false)}>
              <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Web App"
              />
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="flex gap-2">
                {(['web', 'mobile', 'desktop'] as const).map((p) => {
                  const Icon = platformIcons[p]
                  return (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={cn(
                        'flex-1 p-3 rounded-lg border text-center transition-colors',
                        platform === p
                          ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5 mx-auto mb-1',
                        platform === p ? 'text-coral-500' : 'text-slate-400'
                      )} />
                      <span className={cn(
                        'text-sm capitalize',
                        platform === p ? 'text-coral-600 dark:text-coral-400' : 'text-slate-600 dark:text-slate-400'
                      )}>
                        {p}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Project Directory
              </Label>
              <Input
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="/Users/you/Projects/my-app"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local path for Claude Code integration (optional)
              </p>
            </div>

            <Button onClick={handleCreate} isLoading={isCreating} className="w-full">
              Create Project
            </Button>
          </div>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const Icon = platformIcons[project.platform as keyof typeof platformIcons] || Monitor
          const bugCount = project.bugs?.[0]?.count || 0

          return (
            <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-coral-600 dark:text-coral-400" />
                  </div>
                  <ButterflyHelp
                    id={`project-card-${project.id}`}
                    title="Your Project"
                    content="This is one of your projects. Click 'View Actions' to see all bug reports, feedback, and edit requests for this project."
                    position="right"
                  />
                </div>
                {canManage && (
                  <Link href={`/dashboard/projects/${project.id}/settings`}>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {project.platform} {project.framework && `• ${project.framework}`}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Bug className="w-4 h-4" />
                  {bugCount} actions
                </span>
                <span className="flex items-center gap-1">
                  <Key className="w-4 h-4" />
                  {project.api_keys?.[0]?.count || 0} keys
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Link href={`/dashboard/bugs?project=${project.id}`}>
                  <Button variant="ghost" size="sm" className="w-full">
                    View Actions
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}

        {/* Add Project Card */}
        {canManage && (
          <div className="relative">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-coral-300 dark:hover:border-coral-700 transition-colors flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3">
                <Plus className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Create Project
              </span>
            </button>
            <div className="absolute top-2 right-2">
              <ButterflyHelp
                id="create-project-help"
                title="Create a Project"
                content="Projects are where you track bugs and feedback for your apps. Each project gets its own API key to use with the BugRadar SDK."
                position="left"
              />
            </div>
          </div>
        )}
      </div>

      {projects.length === 0 && !canManage && (
        <Card className="p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No projects yet</p>
        </Card>
      )}
    </div>
  )
}
