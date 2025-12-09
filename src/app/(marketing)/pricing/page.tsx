import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Github, Server, Database, Mail, Sparkles, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing | BugRadar',
  description: 'BugRadar is free and open source',
}

export default function PricingPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-6">
            <Github className="w-4 h-4" />
            <span>Open Source</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            It&apos;s free. Forever.
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            BugRadar is 100% open source and self-hosted. No subscriptions, no hidden fees.
            You own your data and your infrastructure.
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-8 md:p-12 max-w-3xl mx-auto border-2 border-coral-500 mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-coral-100 dark:bg-coral-900/30 mb-4">
              <Server className="w-10 h-10 text-coral-600 dark:text-coral-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Self-Hosted</h2>
            <div className="mt-4">
              <span className="text-5xl font-bold text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">forever</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              'Unlimited bug reports',
              'Unlimited projects',
              'Unlimited team members',
              'AI-powered analysis (your Anthropic API)',
              'Email notifications (your Resend account)',
              'Full source code access',
              'Modify and extend as needed',
              'Deploy anywhere',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="https://github.com/postgigg/bugradar" target="_blank" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </Link>
            <Link href="/signup" className="flex-1">
              <Button className="w-full" size="lg">
                Start Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* What You Need */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-8">
            What you&apos;ll need (all have free tiers)
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Database,
                name: 'Supabase',
                desc: 'Free tier: 500MB database, 1GB storage',
                link: 'https://supabase.com'
              },
              {
                icon: Sparkles,
                name: 'Anthropic',
                desc: 'Pay-as-you-go: ~$0.01 per AI analysis',
                link: 'https://anthropic.com'
              },
              {
                icon: Mail,
                name: 'Resend',
                desc: 'Free tier: 100 emails/day',
                link: 'https://resend.com'
              },
            ].map((service, i) => (
              <Card key={i} className="p-4 text-center">
                <service.icon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900 dark:text-white">{service.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{service.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
