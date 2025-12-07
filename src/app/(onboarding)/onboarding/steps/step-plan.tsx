'use client'

import { useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Cloud, Server, Check, ArrowRight, Lock,
  Database, Bot, Mail, Eye, EyeOff, Loader2,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type PlanChoice = 'cloud' | 'self-hosted' | null

export function StepPlan() {
  const { nextStep, organizationId, setOrganizationData } = useOnboardingStore()
  const supabase = createClient()

  const [selectedPlan, setSelectedPlan] = useState<PlanChoice>(null)
  const [showSelfHostedForm, setShowSelfHostedForm] = useState(false)
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
    if (selectedPlan === 'cloud') {
      // Cloud plan - just continue to next step
      nextStep()
      return
    }

    if (selectedPlan === 'self-hosted') {
      if (!showSelfHostedForm) {
        setShowSelfHostedForm(true)
        return
      }

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
  }

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Choose Your Plan
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          How would you like to store your bug data?
        </p>
      </div>

      {!showSelfHostedForm ? (
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Cloud Plan */}
          <Card
            className={cn(
              'p-6 cursor-pointer transition-all hover:border-coral-300 relative',
              selectedPlan === 'cloud' && 'border-2 border-coral-500 bg-coral-50/50 dark:bg-coral-900/10'
            )}
            onClick={() => setSelectedPlan('cloud')}
          >
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-coral-500 text-white text-xs font-medium rounded-full">
              Most Popular
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 rounded-xl flex items-center justify-center">
                <Cloud className="w-6 h-6 text-coral-600 dark:text-coral-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Cloud</h3>
                <p className="text-sm text-slate-500">Managed by BugRadar</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">$39</span>
              <span className="text-slate-500">/month</span>
            </div>

            <ul className="space-y-2 mb-6">
              {[
                'Up to 1,000 bug reports/month',
                'AI enhancement included',
                'Email notifications',
                'Team collaboration',
                'Zero setup required',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {selectedPlan === 'cloud' && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="w-6 h-6 text-coral-500" />
              </div>
            )}
          </Card>

          {/* Self-Hosted Plan */}
          <Card
            className={cn(
              'p-6 cursor-pointer transition-all hover:border-slate-400 relative',
              selectedPlan === 'self-hosted' && 'border-2 border-slate-700 bg-slate-50 dark:bg-slate-800/50'
            )}
            onClick={() => setSelectedPlan('self-hosted')}
          >
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-slate-700 text-white text-xs font-medium rounded-full">
              Own Your Data
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Self-Hosted</h3>
                <p className="text-sm text-slate-500">Your infrastructure</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">$499</span>
              <span className="text-slate-500"> one-time</span>
            </div>

            <ul className="space-y-2 mb-6">
              {[
                'Unlimited bug reports',
                'Your own Supabase database',
                'Your own Anthropic API',
                'Your own Resend account',
                'Complete data ownership',
                'Forever access',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {selectedPlan === 'self-hosted' && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="w-6 h-6 text-slate-700" />
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Self-Hosted Configuration Form */
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">Configure Your Infrastructure</p>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  Enter your API keys below. All keys are encrypted and stored securely.
                  Your bug data will be stored directly in your Supabase database.
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
                <p className="text-sm text-slate-500">AI Enhancement</p>
              </div>
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

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowSelfHostedForm(false)}>
              Back
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedPlan || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {selectedPlan === 'self-hosted' && showSelfHostedForm ? 'Validate & Continue' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
