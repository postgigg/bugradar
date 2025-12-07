'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { createClient } from '@/lib/supabase/client'
import { Building2, User, Code, Briefcase, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const roles = [
  { id: 'developer', label: 'Developer', icon: Code },
  { id: 'founder', label: 'Founder / CEO', icon: Briefcase },
  { id: 'product', label: 'Product Manager', icon: User },
  { id: 'other', label: 'Other', icon: Building2 },
]

export function StepOrganization() {
  const router = useRouter()
  const { nextStep, setOrganization, setOrganizationId, data } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(data.organization?.name || '')
  const [slug, setSlug] = useState(data.organization?.slug || '')
  const [role, setRole] = useState(data.organization?.role || 'developer')
  const [slugEdited, setSlugEdited] = useState(false)

  const supabase = createClient()

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugEdited && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50)
      setSlug(generatedSlug)
    }
  }, [name, slugEdited])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate org ID client-side
      const orgId = crypto.randomUUID()

      // Create organization
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          id: orgId,
          name,
          slug,
        })

      if (orgError) {
        if (orgError.code === '23505') {
          setError('This URL is already taken. Please choose a different one.')
        } else {
          setError(orgError.message)
        }
        setIsLoading(false)
        return
      }

      // Create organization membership (owner)
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: user.id,
          role: 'owner',
        })

      if (memberError) {
        setError(memberError.message)
        setIsLoading(false)
        return
      }

      // Create default subscription (free tier)
      await supabase
        .from('subscriptions')
        .insert({
          organization_id: orgId,
          plan_tier: 'free',
          status: 'active',
        })

      // Store in local state and proceed
      setOrganization({ name, slug, role })
      setOrganizationId(orgId)
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
          Create your workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This is where your team will collaborate on bugs
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
          <Label htmlFor="name">Organization name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Workspace URL</Label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 h-10 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
              bugradar.io/
            </span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                setSlugEdited(true)
              }}
              placeholder="acme-inc"
              className="rounded-l-none"
              required
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This will be your unique workspace URL
          </p>
        </div>

        <div className="space-y-2">
          <Label>Your role</Label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => {
              const Icon = r.icon
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                    role === r.id
                      ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5',
                    role === r.id ? 'text-coral-600 dark:text-coral-400' : 'text-slate-400'
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    role === r.id ? 'text-coral-600 dark:text-coral-400' : 'text-slate-700 dark:text-slate-300'
                  )}>
                    {r.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="submit" isLoading={isLoading}>
          Continue
        </Button>
      </div>
    </form>
  )
}
