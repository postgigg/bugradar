import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Bug, Github, Terminal, CheckCircle, ArrowRight,
  Server, Lock, Database, Mail, Sparkles, Copy,
  Shield, Rocket, ChevronRight, Star, Zap, Eye,
  MousePointer2, Code, Users
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-coral-500 to-coral-600 rounded-xl flex items-center justify-center shadow-lg shadow-coral-500/25">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">BugRadar</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="https://github.com/postgigg/bugradar" target="_blank" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                <Github className="w-4 h-4" />
                <span>Star on GitHub</span>
              </Link>
              <Link href="/login">
                <Button size="sm" className="rounded-full px-5">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-coral-100 via-coral-50 to-transparent dark:from-coral-950/30 dark:via-coral-950/10 dark:to-transparent rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-t from-amber-100 to-transparent dark:from-amber-950/20 dark:to-transparent rounded-full blur-3xl opacity-40" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-8 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>100% Open Source & Free Forever</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Visual bug tracking
                <span className="block mt-2 bg-gradient-to-r from-coral-500 to-coral-600 bg-clip-text text-transparent">
                  you actually own.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Self-hosted bug tracking with AI-powered reports. Screenshot capture, element selection, and Claude AI enhancement. Your data stays on your infrastructure.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/signup">
                  <Button size="lg" className="group rounded-full text-base px-8 h-12 shadow-lg shadow-coral-500/25">
                    Start Free
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="https://github.com/postgigg/bugradar" target="_blank">
                  <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-12">
                    <Github className="w-5 h-5 mr-2" />
                    View Source
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['S', 'M', 'A', 'J'].map((letter, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">200+</span> developers
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - App Preview */}
            <div className="relative">
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center animate-float z-10 border border-slate-100 dark:border-slate-700">
                <Bug className="w-7 h-7 text-coral-500" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-xl flex items-center justify-center animate-float-slow z-10 border border-slate-100 dark:border-slate-700">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div className="absolute top-1/3 -right-8 w-10 h-10 bg-green-500 rounded-full shadow-xl flex items-center justify-center animate-bounce-slow z-10">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>

              {/* Main Preview Card */}
              <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg px-3 py-1.5 text-sm text-slate-400 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                      <Lock className="w-3 h-3 text-green-500" />
                      localhost:3000/app
                    </div>
                  </div>
                </div>

                {/* App Preview Content */}
                <div className="p-6 space-y-4">
                  {/* Bug Report Card */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bug className="w-5 h-5 text-coral-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 dark:text-white text-sm">BUG-042</span>
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">Critical</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm truncate">Login button not responding on mobile</p>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Preview */}
                  <div className="relative bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs text-slate-400">Screenshot attached</span>
                      </div>
                    </div>
                    {/* Annotation Marker */}
                    <div className="absolute top-4 right-8 w-6 h-6 bg-coral-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                      1
                    </div>
                  </div>

                  {/* AI Badge */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800 dark:text-amber-300">AI enhanced with Claude</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
              <Rocket className="w-4 h-4" />
              Quick Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Up and running in 5 minutes
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Clone the repo, connect your services, and start tracking bugs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: Github,
                title: 'Clone the repo',
                desc: 'Get the source code from GitHub and install dependencies.',
                code: 'git clone github.com/postgigg/bugradar'
              },
              {
                step: '02',
                icon: Server,
                title: 'Connect services',
                desc: 'Link your Supabase, Anthropic, and Resend accounts.',
                code: 'npm run dev'
              },
              {
                step: '03',
                icon: Zap,
                title: 'Start tracking',
                desc: 'Deploy anywhere and begin capturing bugs with AI.',
                code: 'npm run build && npm start'
              },
            ].map((item, i) => (
              <Card key={i} className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-bold text-slate-100 dark:text-slate-800 group-hover:text-coral-100 dark:group-hover:text-coral-900/30 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-coral-600 dark:text-coral-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {item.desc}
                </p>
                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300">
                  <code>{item.code}</code>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything you need
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: MousePointer2, title: 'Visual Selection', desc: 'Click any element to report. CSS selectors captured automatically.', color: 'coral' },
              { icon: Sparkles, title: 'AI Enhancement', desc: 'Claude AI analyzes and enriches every bug report.', color: 'amber' },
              { icon: Shield, title: 'Self-Hosted', desc: 'Your data stays on your servers. Full privacy control.', color: 'green' },
              { icon: Code, title: 'Open Source', desc: 'MIT licensed. Modify and extend as needed.', color: 'blue' },
              { icon: Users, title: 'Team Ready', desc: 'Invite your team. Assign bugs. Track progress.', color: 'purple' },
              { icon: Terminal, title: 'Developer First', desc: 'Built with Next.js, TypeScript, and Tailwind.', color: 'slate' },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-coral-200 dark:hover:border-coral-800 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${
                  feature.color === 'coral' ? 'bg-coral-100 dark:bg-coral-900/30' :
                  feature.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  feature.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  feature.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  'bg-slate-100 dark:bg-slate-800'
                } group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === 'coral' ? 'text-coral-600' :
                    feature.color === 'amber' ? 'text-amber-600' :
                    feature.color === 'green' ? 'text-green-600' :
                    feature.color === 'blue' ? 'text-blue-600' :
                    feature.color === 'purple' ? 'text-purple-600' :
                    'text-slate-600'
                  }`} />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Bring your own services
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              All have free tiers. Your data never touches our servers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Database, name: 'Supabase', desc: 'Database, auth & storage', tier: 'Free: 500MB DB, 1GB storage', color: 'emerald' },
              { icon: Sparkles, name: 'Anthropic', desc: 'Claude AI for analysis', tier: 'Pay-as-you-go: ~$0.01/report', color: 'orange' },
              { icon: Mail, name: 'Resend', desc: 'Email notifications', tier: 'Free: 100 emails/day', color: 'blue' },
            ].map((service, i) => (
              <Card key={i} className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  service.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  service.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <service.icon className={`w-8 h-8 ${
                    service.color === 'emerald' ? 'text-emerald-600' :
                    service.color === 'orange' ? 'text-orange-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <h3 className="font-semibold text-xl text-slate-900 dark:text-white mb-1">
                  {service.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  {service.desc}
                </p>
                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400">
                  {service.tier}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-coral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-8">
            <Github className="w-4 h-4" />
            <span>Open Source on GitHub</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to own your bug tracking?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Free forever. Self-hosted. No strings attached.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-full text-base px-10 h-12 bg-white text-slate-900 hover:bg-slate-100">
                Start Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="https://github.com/postgigg/bugradar" target="_blank">
              <Button size="lg" variant="outline" className="rounded-full text-base px-10 h-12 border-white/20 text-white hover:bg-white/10">
                <Github className="w-5 h-5 mr-2" />
                View Source
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center">
                <Bug className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">BugRadar</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-500 text-sm">Open Source Bug Tracking</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="https://github.com/postgigg/bugradar" target="_blank" className="text-slate-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <span className="text-slate-600 text-sm">MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
