'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Key, Trash2, Plus, Copy, Check, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  key_hint: string
  environment: 'live' | 'test'
  is_active: boolean
  last_used_at: string | null
}

interface ApiKeysManagerProps {
  projectId: string
  initialKeys: ApiKey[]
}

export function ApiKeysManager({ projectId, initialKeys }: ApiKeysManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'test'>('test')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  async function handleCreateKey() {
    if (!newKeyName.trim()) {
      setError('Please enter a key name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const prefix = newKeyEnv === 'live' ? 'br_live_' : 'br_test_'
      const fullKey = `${prefix}${generateRandomKey()}`
      const keyHash = await hashKey(fullKey)
      const keyHint = `****${fullKey.slice(-4)}`

      const { data: newKey, error: insertError } = await supabase
        .from('api_keys')
        .insert({
          project_id: projectId,
          name: newKeyName.trim(),
          key_prefix: fullKey.substring(0, 7),
          key_hash: keyHash,
          key_hint: keyHint,
          environment: newKeyEnv,
          created_by: user.id,
        })
        .select('id, name, key_prefix, key_hint, environment, is_active, last_used_at')
        .single()

      if (insertError) throw insertError

      // Check if insert was silently blocked by RLS
      if (!newKey) {
        throw new Error('Failed to create API key. You may not have permission to manage API keys for this project.')
      }

      setApiKeys([newKey, ...apiKeys])
      setCreatedKey(fullKey)
      setNewKeyName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteKey(keyId: string) {
    setDeletingId(keyId)
    try {
      const { error: deleteError } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)

      if (deleteError) throw deleteError

      setApiKeys(apiKeys.filter(k => k.id !== keyId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete key')
    } finally {
      setDeletingId(null)
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCloseNewKeyModal() {
    setCreatedKey(null)
    setIsCreating(false)
    setCopied(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">API Keys</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage SDK API keys</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
          <Key className="w-4 h-4 mr-2" />
          Create Key
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Key Form */}
      {isCreating && !createdKey && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyName">Key Name</Label>
            <Input
              id="keyName"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Development, Production, CI/CD"
            />
          </div>
          <div className="space-y-2">
            <Label>Environment</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewKeyEnv('test')}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                  newKeyEnv === 'test'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                )}
              >
                Test
              </button>
              <button
                type="button"
                onClick={() => setNewKeyEnv('live')}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                  newKeyEnv === 'live'
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                )}
              >
                Live
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreateKey} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Key
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Show Created Key (only once) */}
      {createdKey && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-700 dark:text-green-300">API Key Created!</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            Copy this key now. You won't be able to see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 border border-green-300 dark:border-green-700">
              {createdKey}
            </code>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copyToClipboard(createdKey)}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCloseNewKeyModal}>
            Done
          </Button>
        </div>
      )}

      {/* Keys List */}
      {apiKeys.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400">No API keys yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Create a key to start using the SDK</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${key.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{key.name}</p>
                  <code className="text-xs text-slate-500">{key.key_prefix}...{key.key_hint}</code>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  key.environment === 'live'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {key.environment}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleDeleteKey(key.id)}
                disabled={deletingId === key.id}
              >
                {deletingId === key.id ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
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
