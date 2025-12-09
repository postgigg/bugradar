'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bug, Database, CheckCircle, Loader2, AlertCircle, ArrowRight, Copy, Check, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'running' | 'complete' | 'error'>('intro')
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [orgName, setOrgName] = useState('My Organization')
  const [apiKey, setApiKey] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const runSetup = async () => {
    setStep('running')
    setStatus('Setting up your instance...')

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed')
      }

      setApiKey(data.apiKey)
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStep('error')
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-coral-500 rounded-2xl flex items-center justify-center">
            <Bug className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
          BugRadar Setup
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Self-hosted bug tracking - let&apos;s get you started
        </p>

        {step === 'intro' && (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                Before you continue:
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Make sure you&apos;ve run <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">npx supabase db push</code> to create the database tables first.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                placeholder="My Company"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                What this will do:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Create your organization</li>
                <li>• Create a default project</li>
                <li>• Generate your API key</li>
                <li>• Set up unlimited usage (self-hosted)</li>
              </ul>
            </div>

            <Button
              onClick={runSetup}
              className="w-full"
              size="lg"
              disabled={!orgName.trim()}
            >
              Run Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'running' && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-coral-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{status}</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Setup Complete!
              </h2>
            </div>

            {apiKey && (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-coral-500" />
                  <span className="font-medium text-slate-900 dark:text-white text-sm">Your API Key</span>
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 bg-slate-900 text-green-400 px-3 py-2 rounded text-xs font-mono overflow-x-auto">
                    {apiKey}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyApiKey}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Save this key now! It won&apos;t be shown again.
                </p>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">Next Steps:</h3>
              <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
                <li>Install the SDK in your app: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">npm install bugradar</code></li>
                <li>Initialize with your API key and dashboard URL</li>
                <li>Start capturing bugs!</li>
              </ol>
            </div>

            <Button onClick={() => router.push('/dashboard')} className="w-full" size="lg">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Setup Failed
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-2">
              {error}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Make sure you&apos;ve run <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">npx supabase db push</code> first.
            </p>
            <Button onClick={() => setStep('intro')} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
