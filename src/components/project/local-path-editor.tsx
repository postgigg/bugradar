'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { FolderOpen, Terminal, Check, Loader2 } from 'lucide-react'

interface LocalPathEditorProps {
  projectId: string
  initialPath: string | null
}

export function LocalPathEditor({ projectId, initialPath }: LocalPathEditorProps) {
  const router = useRouter()
  const [localPath, setLocalPath] = useState(initialPath || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!localPath.trim()) return
    setIsSaving(true)

    try {
      const response = await fetch('/api/projects/update-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          localPath: localPath.trim()
        })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to save path:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanged = localPath !== (initialPath || '')

  return (
    <Card className="p-6 border-coral-200 dark:border-coral-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center">
          <Terminal className="w-5 h-5 text-coral-600 dark:text-coral-400" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Claude Code Integration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure automatic AI-powered bug fixing</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="local_path" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Project Directory
          </Label>
          <Input
            id="local_path"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            placeholder="/Users/you/Projects/my-app"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The local filesystem path to your project. This allows Claude Code to automatically open your project when fixing bugs.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanged || isSaving}
          className={saved ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </Card>
  )
}
