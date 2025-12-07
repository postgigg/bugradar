import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Building2, CreditCard, Bell, Shield, Trash2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Settings | BugRadar',
  description: 'Manage your account and organization settings',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(id, name, slug)')
    .eq('user_id', user?.id)
    .limit(1)

  const organization = memberships?.[0]?.organizations as any

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your account and organization preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-coral-600 dark:text-coral-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your personal information</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={profile?.full_name || ''} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user?.email || ''} disabled className="bg-slate-50 dark:bg-slate-800" />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </Card>

      {/* Organization Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Organization</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your workspace settings</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input id="orgName" defaultValue={organization?.name || ''} placeholder="Organization name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Workspace URL</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm dark:border-slate-600 dark:bg-slate-800">
                bugradar.io/
              </span>
              <Input
                id="slug"
                defaultValue={organization?.slug || ''}
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure how you receive alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Email notifications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive bug updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coral-300 dark:peer-focus:ring-coral-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-coral-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">In-app notifications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Show notifications in the dashboard</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coral-300 dark:peer-focus:ring-coral-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-coral-500"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Billing Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Billing</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your subscription and billing</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Free Plan</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">50 actions/month • 10 AI credits</p>
          </div>
          <Button variant="outline">Upgrade</Button>
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

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Delete Organization</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete your workspace and all data</p>
            </div>
            <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
