'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { createClient } from '@/lib/supabase/client'
import {
  Monitor, Smartphone, MonitorSmartphone,
  AlertCircle, ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

const platforms = [
  { id: 'web', label: 'Web', icon: Monitor, description: 'Browser-based application' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, description: 'iOS or Android app' },
  { id: 'desktop', label: 'Desktop', icon: MonitorSmartphone, description: 'Desktop application' },
]

const frameworks = [
  { id: 'react', label: 'React' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'vue', label: 'Vue' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'angular', label: 'Angular' },
  { id: 'vanilla', label: 'Vanilla JS' },
  { id: 'react-native', label: 'React Native' },
  { id: 'flutter', label: 'Flutter' },
  { id: 'other', label: 'Other' },
]

export function StepProject() {
  const { nextStep, prevStep, setProject, setApiKeys, data } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(data.project?.name || '')
  const [platform, setPlatform] = useState<'web' | 'mobile' | 'desktop'>(
    data.project?.platform || 'web'
  )
  const [framework, setFramework] = useState<string | null>(
    data.project?.framework || null
  )

  const supabase = createClient()

  // Filter frameworks based on platform
  const availableFrameworks = frameworks.filter(f => {
    if (platform === 'web') {
      return ['react', 'nextjs', 'vue', 'svelte', 'angular', 'vanilla', 'other'].includes(f.id)
    }
    if (platform === 'mobile') {
      return ['react-native', 'flutter', 'other'].includes(f.id)
    }
    return ['other'].includes(f.id)
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) throw new Error('Organization not found')

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          organization_id: membership.organization_id,
          name,
          slug,
          platform,
          framework,
        })
        .select()
        .single()

      if (projectError) {
        setError(projectError.message)
        setIsLoading(false)
        return
      }

      // Generate API keys
      const devKey = `br_test_${generateRandomKey()}`
      const prodKey = `br_live_${generateRandomKey()}`

      // Store development key
      await supabase.from('api_keys').insert({
        project_id: project.id,
        name: 'Development',
        key_prefix: devKey.substring(0, 7),
        key_hash: await hashKey(devKey),
        key_hint: `****${devKey.slice(-4)}`,
        environment: 'test',
        created_by: user.id,
      })

      // Store production key
      await supabase.from('api_keys').insert({
        project_id: project.id,
        name: 'Production',
        key_prefix: prodKey.substring(0, 7),
        key_hash: await hashKey(prodKey),
        key_hint: `****${prodKey.slice(-4)}`,
        environment: 'live',
        created_by: user.id,
      })

      // Store in local state
      setProject({ name, platform, framework })
      setApiKeys({ development: devKey, production: prodKey })
      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Create your first project
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Projects help you organize bugs by app or repository
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectName">Project name</Label>
          <Input
            id="projectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Web App"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Platform</Label>
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((p) => {
              const Icon = p.icon
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPlatform(p.id as 'web' | 'mobile' | 'desktop')
                    setFramework(null)
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-colors',
                    platform === p.id
                      ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  )}
                >
                  <Icon className={cn(
                    'w-6 h-6',
                    platform === p.id ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    platform === p.id ? 'text-coral-600 dark:text-coral-400' : 'text-slate-700 dark:text-slate-300'
                  )}>
                    {p.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Framework <span className="text-slate-400 font-normal">(optional)</span></Label>
          <div className="flex flex-wrap gap-2">
            {availableFrameworks.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFramework(framework === f.id ? null : f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                  framework === f.id
                    ? 'border-coral-500 bg-coral-50 text-coral-600 dark:bg-coral-900/20 dark:text-coral-400'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="button" variant="ghost" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Continue
        </Button>
      </div>
    </form>
  )
}

// Helper functions
function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
