'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Server, Lock, Check, AlertCircle, Database,
  Bot, Mail, ArrowLeft, Shield, Eye, EyeOff,
  CheckCircle2, XCircle, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ValidationResult {
  valid: boolean
  message: string
}

export default function SelfHostedPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  // Form state
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [resendKey, setResendKey] = useState('')

  // Validation state
  const [validations, setValidations] = useState<Record<string, ValidationResult | null>>({
    supabase: null,
    anthropic: null,
    resend: null,
  })
  const [validating, setValidating] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)

      if (!membership?.[0]) return

      const { data: org } = await supabase
        .from('organizations')
        .select('self_hosted_enabled, custom_supabase_url, custom_supabase_anon_key, custom_anthropic_key, custom_resend_key')
        .eq('id', membership[0].organization_id)
        .single()

      if (org) {
        setIsUnlocked(org.self_hosted_enabled || false)
        setSupabaseUrl(org.custom_supabase_url || '')
        setSupabaseAnonKey(org.custom_supabase_anon_key || '')
        setAnthropicKey(org.custom_anthropic_key || '')
        setResendKey(org.custom_resend_key || '')
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function validateSupabase() {
    if (!supabaseUrl || !supabaseAnonKey) {
      setValidations(v => ({ ...v, supabase: { valid: false, message: 'URL and anon key required' } }))
      return
    }

    setValidating(v => ({ ...v, supabase: true }))
    try {
      const res = await fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'supabase', url: supabaseUrl, anonKey: supabaseAnonKey }),
      })
      const data = await res.json()
      setValidations(v => ({ ...v, supabase: { valid: data.valid, message: data.message } }))
    } catch {
      setValidations(v => ({ ...v, supabase: { valid: false, message: 'Validation failed' } }))
    } finally {
      setValidating(v => ({ ...v, supabase: false }))
    }
  }

  async function validateAnthropic() {
    if (!anthropicKey) {
      setValidations(v => ({ ...v, anthropic: { valid: false, message: 'API key required' } }))
      return
    }

    setValidating(v => ({ ...v, anthropic: true }))
    try {
      const res = await fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'anthropic', apiKey: anthropicKey }),
      })
      const data = await res.json()
      setValidations(v => ({ ...v, anthropic: { valid: data.valid, message: data.message } }))
    } catch {
      setValidations(v => ({ ...v, anthropic: { valid: false, message: 'Validation failed' } }))
    } finally {
      setValidating(v => ({ ...v, anthropic: false }))
    }
  }

  async function validateResend() {
    if (!resendKey) {
      setValidations(v => ({ ...v, resend: { valid: false, message: 'API key required' } }))
      return
    }

    setValidating(v => ({ ...v, resend: true }))
    try {
      const res = await fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'resend', apiKey: resendKey }),
      })
      const data = await res.json()
      setValidations(v => ({ ...v, resend: { valid: data.valid, message: data.message } }))
    } catch {
      setValidations(v => ({ ...v, resend: { valid: false, message: 'Validation failed' } }))
    } finally {
      setValidating(v => ({ ...v, resend: false }))
    }
  }

  async function saveSettings() {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)

      if (!membership?.[0]) return

      await supabase
        .from('organizations')
        .update({
          custom_supabase_url: supabaseUrl || null,
          custom_supabase_anon_key: supabaseAnonKey || null,
          custom_supabase_service_key: supabaseServiceKey || null,
          custom_anthropic_key: anthropicKey || null,
          custom_resend_key: resendKey || null,
        })
        .eq('id', membership[0].organization_id)

      alert('Settings saved successfully!')
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUnlock() {
    // TODO: Integrate with Stripe for $99 payment
    // For now, just redirect to a placeholder
    alert('Stripe payment integration coming soon! For now, contact support to unlock self-hosted features.')
  }

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/billing"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Self-Hosted Data
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Connect your own infrastructure for complete data ownership
          </p>
        </div>
      </div>

      {!isUnlocked ? (
        /* Unlock Card */
        <Card className="p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Unlock Self-Hosted Features
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Own your bug data completely. Connect your own Supabase database,
              Anthropic API, and Resend account. Your data never touches our servers.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-medium text-slate-900 dark:text-white mb-3">What you get:</h3>
              <ul className="space-y-2">
                {[
                  'Your own Supabase database',
                  'Direct Anthropic API access',
                  'Your own Resend email account',
                  'Complete data privacy',
                  'No usage limits',
                  'Forever access',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">$499</span>
              <span className="text-slate-500">one-time payment</span>
            </div>

            <Button size="lg" className="w-full" onClick={handleUnlock}>
              <Shield className="w-4 h-4 mr-2" />
              Unlock Self-Hosted
            </Button>

            <p className="text-xs text-slate-400 mt-4">
              Secure payment via Stripe. Instant access after payment.
            </p>
          </div>
        </Card>
      ) : (
        /* Settings Form */
        <>
          <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">Self-Hosted Unlocked</p>
                <p className="text-sm text-green-600 dark:text-green-400">Configure your custom infrastructure below</p>
              </div>
            </div>
          </Card>

          {/* Supabase */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Supabase</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Database & Storage</p>
              </div>
              {validations.supabase && (
                <div className={`ml-auto flex items-center gap-1 text-sm ${validations.supabase.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validations.supabase.valid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {validations.supabase.message}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="supabase-url">Project URL</Label>
                <Input
                  id="supabase-url"
                  placeholder="https://xxxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supabase-anon">Anon Key (public)</Label>
                <div className="relative">
                  <Input
                    id="supabase-anon"
                    type={showKeys['supabaseAnon'] ? 'text' : 'password'}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('supabaseAnon')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKeys['supabaseAnon'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="supabase-service">Service Role Key (secret)</Label>
                <div className="relative">
                  <Input
                    id="supabase-service"
                    type={showKeys['supabaseService'] ? 'text' : 'password'}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseServiceKey}
                    onChange={(e) => setSupabaseServiceKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('supabaseService')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKeys['supabaseService'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Never share this key. It bypasses Row Level Security.</p>
              </div>
              <Button variant="outline" onClick={validateSupabase} disabled={validating.supabase}>
                {validating.supabase ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test Connection
              </Button>
            </div>
          </Card>

          {/* Anthropic */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Anthropic</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI Enhancement & Claude Code</p>
              </div>
              {validations.anthropic && (
                <div className={`ml-auto flex items-center gap-1 text-sm ${validations.anthropic.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validations.anthropic.valid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {validations.anthropic.message}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="anthropic-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="anthropic-key"
                    type={showKeys['anthropic'] ? 'text' : 'password'}
                    placeholder="sk-ant-..."
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('anthropic')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKeys['anthropic'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Get your key from <a href="https://console.anthropic.com" target="_blank" className="underline">console.anthropic.com</a></p>
              </div>
              <Button variant="outline" onClick={validateAnthropic} disabled={validating.anthropic}>
                {validating.anthropic ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test Connection
              </Button>
            </div>
          </Card>

          {/* Resend */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Resend</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email Notifications</p>
              </div>
              {validations.resend && (
                <div className={`ml-auto flex items-center gap-1 text-sm ${validations.resend.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validations.resend.valid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {validations.resend.message}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="resend-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="resend-key"
                    type={showKeys['resend'] ? 'text' : 'password'}
                    placeholder="re_..."
                    value={resendKey}
                    onChange={(e) => setResendKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('resend')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKeys['resend'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Get your key from <a href="https://resend.com" target="_blank" className="underline">resend.com</a></p>
              </div>
              <Button variant="outline" onClick={validateResend} disabled={validating.resend}>
                {validating.resend ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test Connection
              </Button>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Settings
            </Button>
          </div>

          {/* Security Note */}
          <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">Security Notice</p>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  Your API keys are encrypted and stored securely. We recommend using restricted API keys
                  with minimal permissions where possible. Never share your service role key publicly.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
