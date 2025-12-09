'use client'

import { useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Server, ArrowRight,
  Database, Bot, Mail, Eye, EyeOff, Loader2,
  CheckCircle2, XCircle, AlertCircle, ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function StepPlan() {
  const { nextStep, organizationId } = useOnboardingStore()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)

  // Self-hosted form state
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [resendKey, setResendKey] = useState('')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  // Validation
  const [validations, setValidations] = useState<Record<string, { valid: boolean; message: string } | null>>({})
  const [validating, setValidating] = useState<Record<string, boolean>>({})

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function validateKey(type: string, data: any) {
    setValidating(v => ({ ...v, [type]: true }))
    try {
      const res = await fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data }),
      })
      const result = await res.json()
      setValidations(v => ({ ...v, [type]: result }))
      return result.valid
    } catch {
      setValidations(v => ({ ...v, [type]: { valid: false, message: 'Validation failed' } }))
      return false
    } finally {
      setValidating(v => ({ ...v, [type]: false }))
    }
  }

  async function handleContinue() {
    // Validate all keys
    setIsLoading(true)
    const results = await Promise.all([
      validateKey('supabase', { url: supabaseUrl, anonKey: supabaseAnonKey }),
      validateKey('anthropic', { apiKey: anthropicKey }),
      validateKey('resend', { apiKey: resendKey }),
    ])

    if (results.every(r => r)) {
      // Save self-hosted settings
      try {
        await supabase
          .from('organizations')
          .update({
            self_hosted_enabled: true,
            self_hosted_purchased_at: new Date().toISOString(),
            custom_supabase_url: supabaseUrl,
            custom_supabase_anon_key: supabaseAnonKey,
            custom_supabase_service_key: supabaseServiceKey,
            custom_anthropic_key: anthropicKey,
            custom_resend_key: resendKey,
          })
          .eq('id', organizationId)

        nextStep()
      } catch (err) {
        console.error('Failed to save settings:', err)
      }
    }
    setIsLoading(false)
  }

  const allFieldsFilled = supabaseUrl && supabaseAnonKey && supabaseServiceKey && anthropicKey && resendKey

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
          <Server className="w-8 h-8 text-slate-600 dark:text-slate-400" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Connect Your Services
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          BugRadar is self-hosted. Connect your own accounts for complete data ownership.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300">Free & Open Source</p>
              <p className="text-blue-700 dark:text-blue-400 mt-1">
                All services below have free tiers. Your data is stored on your own infrastructure - we never see it.
              </p>
            </div>
          </div>
        </Card>

        {/* Supabase */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">Supabase</h3>
              <p className="text-sm text-slate-500">Database & Storage</p>
            </div>
            <a href="https://supabase.com" target="_blank" className="text-xs text-coral-500 hover:text-coral-600 flex items-center gap-1">
              Get free account <ExternalLink className="w-3 h-3" />
            </a>
            {validations.supabase && (
              <div className={`flex items-center gap-1 text-sm ${validations.supabase.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validations.supabase.valid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {validations.supabase.message}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <Label>Project URL</Label>
              <Input placeholder="https://xxxxx.supabase.co" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} />
            </div>
            <div>
              <Label>Anon Key</Label>
              <div className="relative">
                <Input type={showKeys['anon'] ? 'text' : 'password'} placeholder="eyJhbGci..." value={supabaseAnonKey} onChange={(e) => setSupabaseAnonKey(e.target.value)} />
                <button type="button" onClick={() => toggleShowKey('anon')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showKeys['anon'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Service Role Key</Label>
              <div className="relative">
                <Input type={showKeys['service'] ? 'text' : 'password'} placeholder="eyJhbGci..." value={supabaseServiceKey} onChange={(e) => setSupabaseServiceKey(e.target.value)} />
                <button type="button" onClick={() => toggleShowKey('service')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showKeys['service'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Anthropic */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">Anthropic</h3>
              <p className="text-sm text-slate-500">AI Enhancement (Claude)</p>
            </div>
            <a href="https://console.anthropic.com" target="_blank" className="text-xs text-coral-500 hover:text-coral-600 flex items-center gap-1">
              Get API key <ExternalLink className="w-3 h-3" />
            </a>
            {validations.anthropic && (
              <div className={`flex items-center gap-1 text-sm ${validations.anthropic.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validations.anthropic.valid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {validations.anthropic.message}
              </div>
            )}
          </div>
          <div>
            <Label>API Key</Label>
            <div className="relative">
              <Input type={showKeys['anthropic'] ? 'text' : 'password'} placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} />
              <button type="button" onClick={() => toggleShowKey('anthropic')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showKeys['anthropic'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </Card>

        {/* Resend */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">Resend</h3>
              <p className="text-sm text-slate-500">Email Notifications</p>
            </div>
            <a href="https://resend.com" target="_blank" className="text-xs text-coral-500 hover:text-coral-600 flex items-center gap-1">
              Get free account <ExternalLink className="w-3 h-3" />
            </a>
            {validations.resend && (
              <div className={`flex items-center gap-1 text-sm ${validations.resend.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validations.resend.valid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {validations.resend.message}
              </div>
            )}
          </div>
          <div>
            <Label>API Key</Label>
            <div className="relative">
              <Input type={showKeys['resend'] ? 'text' : 'password'} placeholder="re_..." value={resendKey} onChange={(e) => setResendKey(e.target.value)} />
              <button type="button" onClick={() => toggleShowKey('resend')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showKeys['resend'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!allFieldsFilled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Validate & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
