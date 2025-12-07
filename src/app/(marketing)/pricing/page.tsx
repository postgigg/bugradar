import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, X, HelpCircle, Server, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing | BugRadar',
  description: 'Simple, transparent pricing for BugRadar',
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for side projects and trying out BugRadar.',
    features: {
      bugs: '50/month',
      aiCredits: '10',
      projects: '2',
      teamMembers: '3',
      support: 'Community',
      screenshot: true,
      aiEnhance: true,
      kanban: true,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
    },
    cta: 'Get Started Free',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For professional developers and growing projects.',
    popular: true,
    features: {
      bugs: '500/month',
      aiCredits: '50',
      projects: '10',
      teamMembers: '10',
      support: 'Priority',
      screenshot: true,
      aiEnhance: true,
      kanban: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: false,
    },
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    description: 'For teams that need collaboration and scale.',
    features: {
      bugs: 'Unlimited',
      aiCredits: '200',
      projects: 'Unlimited',
      teamMembers: '25',
      support: 'Priority',
      screenshot: true,
      aiEnhance: true,
      kanban: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
    },
    cta: 'Start Free Trial',
    ctaVariant: 'outline' as const,
  },
]

const featureList = [
  { key: 'bugs', label: 'Actions per month' },
  { key: 'aiCredits', label: 'AI credits' },
  { key: 'projects', label: 'Projects' },
  { key: 'teamMembers', label: 'Team members' },
  { key: 'support', label: 'Support' },
  { key: 'screenshot', label: 'Screenshot capture' },
  { key: 'aiEnhance', label: 'AI description enhancement' },
  { key: 'kanban', label: 'Kanban dashboard' },
  { key: 'apiAccess', label: 'API access' },
  { key: 'prioritySupport', label: 'Priority support' },
  { key: 'customBranding', label: 'Custom branding' },
]

export default function PricingPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Simple pricing. No surprises.
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Start free, upgrade when you need more. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${plan.popular ? 'border-coral-500 border-2 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-coral-500 text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {plan.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {plan.period}
                </span>
              </div>

              <Link href="/signup">
                <Button variant={plan.ctaVariant} className="w-full mb-6">
                  {plan.cta}
                </Button>
              </Link>

              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {plan.features.bugs} actions
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {plan.features.aiCredits} AI credits
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {plan.features.projects} projects
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {plan.features.teamMembers} team members
                  </span>
                </li>
                {plan.features.apiAccess && (
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">API access</span>
                  </li>
                )}
              </ul>
            </Card>
          ))}
        </div>

        {/* Self-Hosted Option */}
        <Card className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 max-w-3xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Server className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Self-Hosted Data</h3>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                  One-time
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Own your data completely. Connect your own Supabase, Anthropic, and Resend accounts.
                Bugs go directly to your infrastructure — we never see your data. Unlimited everything.
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Lock className="w-4 h-4" />
                  Your Supabase
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Lock className="w-4 h-4" />
                  Your Anthropic API
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Lock className="w-4 h-4" />
                  Your Resend
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$499</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">one-time activation</span>
                </div>
                <Link href="/signup">
                  <Button>
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Feature Comparison Table */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Compare all features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="text-center py-4 px-4 text-sm font-medium text-slate-900 dark:text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureList.map((feature) => (
                  <tr key={feature.key} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                      {feature.label}
                    </td>
                    {plans.map((plan) => {
                      const value = plan.features[feature.key as keyof typeof plan.features]
                      return (
                        <td key={plan.name} className="py-4 px-4 text-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-slate-700 dark:text-slate-300">{value}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            {[
              { q: 'What counts as an "action"?', a: 'Any action submitted through the SDK or manually created in the dashboard counts towards your monthly limit.' },
              { q: 'What are AI credits?', a: 'AI credits are used for AI-powered features like description enhancement and fix suggestions. 1 credit = 1 AI operation.' },
              { q: 'Can I change plans anytime?', a: 'Yes! You can upgrade or downgrade at any time. Changes take effect immediately.' },
              { q: 'Do you offer refunds?', a: 'Yes, we offer a 30-day money-back guarantee. No questions asked.' },
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-200 dark:border-slate-700 pb-6">
                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-coral-500" />
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
