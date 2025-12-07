'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import {
  Users, UserPlus, Shield, User, Crown,
  MoreVertical, Trash2, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface Member {
  id: string
  role: string
  joined_at: string
  users: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

interface TeamListProps {
  members: Member[]
  currentUserId: string
  canManage: boolean
  organizationId: string
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: User,
}

const roleColors = {
  owner: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  admin: 'text-coral-600 bg-coral-100 dark:bg-coral-900/30 dark:text-coral-400',
  member: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400',
}

export function TeamList({ members, currentUserId, canManage, organizationId }: TeamListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setIsInviting(true)
    setInviteError(null)

    // In a real app, you'd send an invitation email
    // For now, we'll just show a success message
    setTimeout(() => {
      setIsInviting(false)
      setShowInvite(false)
      setInviteEmail('')
      alert(`Invitation sent to ${inviteEmail}`)
    }, 1000)
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)

    router.refresh()
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    await supabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('id', memberId)

    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Invite Button */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <Card className="p-6 border-coral-200 dark:border-coral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Invite Team Member</h3>
            <button onClick={() => setShowInvite(false)}>
              <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="admin">Admin - Can manage settings and members</option>
                <option value="member">Member - Can manage actions</option>
                <option value="viewer">Viewer - Read-only access</option>
              </select>
            </div>

            {inviteError && (
              <p className="text-sm text-red-600">{inviteError}</p>
            )}

            <Button onClick={handleInvite} isLoading={isInviting} className="w-full">
              Send Invitation
            </Button>
          </div>
        </Card>
      )}

      {/* Members List */}
      <Card className="divide-y divide-slate-200 dark:divide-slate-700">
        {members.map((member) => {
          const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || User
          const roleColor = roleColors[member.role as keyof typeof roleColors] || roleColors.member
          const isCurrentUser = member.users.id === currentUserId
          const isOwner = member.role === 'owner'

          return (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-coral-600 dark:text-coral-400">
                    {member.users.full_name?.charAt(0) || member.users.email.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {member.users.full_name || 'Unnamed User'}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs text-slate-400">(you)</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {member.users.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1', roleColor)}>
                  <RoleIcon className="w-3 h-3" />
                  {member.role}
                </span>

                <span className="text-xs text-slate-400 hidden sm:block">
                  Joined {formatDate(member.joined_at)}
                </span>

                {canManage && !isOwner && !isCurrentUser && (
                  <div className="relative group">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {member.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                      </button>
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </Card>

      {members.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No team members</p>
        </Card>
      )}
    </div>
  )
}
