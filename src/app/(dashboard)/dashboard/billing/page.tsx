import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Check, Zap, Crown, Building2, Server, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Billing | BugRadar',
  description: 'Manage your subscription and billing',
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for side projects',
    features: ['50 actions/month', '10 AI credits', '2 projects', '3 team members', 'Community support'],
    tier: 'free',
    icon: Zap,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For growing teams',
    features: ['500 actions/month', '50 AI credits', '10 projects', '10 team members', 'API access', 'Priority support'],
    tier: 'pro',
    popular: true,
    icon: Crown,
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    description: 'For larger organizations',
    features: ['Unlimited actions', '200 AI credits', 'Unlimited projects', '25 team members', 'API access', 'Custom branding', 'Priority support'],
    tier: 'team',
    icon: Building2,
  },
]

export default async function BillingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user?.id)
    .limit(1)

  const organizationId = membership?.[0]?.organization_id

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId || '')
    .single()

  const currentTier = subscription?.plan_tier || 'free'

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Billing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-coral-600 dark:text-coral-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Current Plan</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">You are on the {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white capitalize">{currentTier} Plan</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {subscription?.max_bugs_per_month || 50} actions/month • {subscription?.ai_credits_limit || 10} AI credits
              </p>
            </div>
            {currentTier === 'free' && (
              <Button>Upgrade</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.tier === currentTier
            const Icon = plan.icon

            return (
              <Card
                key={plan.tier}
                className={cn(
                  'p-6 relative',
                  plan.popular && 'border-2 border-coral-500',
                  isCurrentPlan && 'bg-slate-50 dark:bg-slate-800/50'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-coral-500 text-white text-xs font-medium rounded-full">
                    Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    plan.tier === 'free' && 'bg-slate-100 dark:bg-slate-800',
                    plan.tier === 'pro' && 'bg-coral-100 dark:bg-coral-900/30',
                    plan.tier === 'team' && 'bg-coral-100 dark:bg-coral-900/30'
                  )}>
                    <Icon className={cn(
                      'w-5 h-5',
                      plan.tier === 'free' && 'text-slate-600 dark:text-slate-400',
                      plan.tier === 'pro' && 'text-coral-600 dark:text-coral-400',
                      plan.tier === 'team' && 'text-coral-600 dark:text-coral-400'
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                  className="w-full"
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Self-Hosted Option */}
      <Card className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">Self-Hosted Data</h3>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                One-time
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Own your data. Connect your own Supabase, Anthropic, and Resend accounts.
              Bugs go directly to your infrastructure — we never see your data.
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                Your Supabase
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                Your Anthropic API
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                Your Resend
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white">$99</span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">one-time</span>
              </div>
              <Link href="/dashboard/settings/self-hosted">
                <Button>
                  Unlock Self-Hosted
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Usage */}
      <Card className="p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Usage This Month</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Actions Reported</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              0 <span className="text-sm font-normal text-slate-400">/ {subscription?.max_bugs_per_month || 50}</span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">AI Credits Used</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {subscription?.ai_credits_used || 0} <span className="text-sm font-normal text-slate-400">/ {subscription?.ai_credits_limit || 10}</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
