import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Bug, Zap, Camera, Sparkles, LayoutGrid,
  Terminal, CheckCircle, ArrowRight, Code,
  MousePointer2, Eye, MessageSquare, Shield,
  Rocket, Star, ChevronRight, Github, Twitter,
  Lightbulb, PenLine, Wand2, Send, Target, Layers,
  Server, Lock
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">BugRadar</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">How it Works</Link>
              <Link href="#pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Pricing</Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Login</Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - NEW ANGLE: AI-Powered Development Feedback */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-coral-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-coral-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-slow" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }} />

          {/* Geometric Shapes */}
          <div className="absolute top-32 right-1/4 w-20 h-20 border-4 border-coral-200 dark:border-coral-800 rounded-2xl rotate-12 animate-float opacity-60" />
          <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-coral-100 dark:bg-coral-900/30 rounded-full animate-float-slow opacity-60" />
          <div className="absolute top-1/2 right-20 w-12 h-12 border-4 border-amber-200 dark:border-amber-800 rounded-lg rotate-45 animate-float-delayed opacity-60" />
          <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-coral-200 dark:bg-coral-900/30 rounded-full animate-bounce-slow opacity-60" />

          {/* Dotted Pattern */}
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />

          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="h-full w-full" style={{
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }} />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-6 animate-fade-in-down">
                <Wand2 className="w-4 h-4" />
                <span>AI-Powered Development Workflow</span>
              </div>

              {/* Headline - NEW ANGLE */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight animate-fade-in-up">
                Point. Click.
                <span className="relative">
                  <span className="relative z-10 text-coral-500"> Claude fixes it.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 150 4 298 10" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" className="animate-fade-in" style={{ animationDelay: '0.5s' }}/>
                  </svg>
                </span>
              </h1>

              {/* Subheadline - BROADER */}
              <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Select any element in your localhost app. Report a bug, request a change, or give feedback.
                <span className="font-semibold text-slate-900 dark:text-white"> AI launches Claude Code and fixes it automatically.</span>
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">3 Modes</div>
                  <div className="text-sm text-slate-500">Bug • Feedback • Edit</div>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">1-Click</div>
                  <div className="text-sm text-slate-500">Claude Code launch</div>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">AI</div>
                  <div className="text-sm text-slate-500">Enhanced reports</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link href="/signup">
                  <Button size="lg" className="group w-full sm:w-auto text-base px-8 animate-glow">
                    Start Free
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">500+</span> developers
                </div>
              </div>
            </div>

            {/* Right Content - Report Mode Selector Preview */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {/* Floating Elements */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center animate-float z-10">
                <Terminal className="w-8 h-8 text-coral-500" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-14 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-xl flex items-center justify-center animate-float-slow z-10">
                <Sparkles className="w-7 h-7 text-amber-500" />
              </div>
              <div className="absolute top-1/2 -right-10 w-12 h-12 bg-green-500 rounded-full shadow-xl flex items-center justify-center animate-bounce-slow z-10">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>

              {/* Main Preview Card - Report Mode Selector */}
              <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg px-3 py-1 text-sm text-slate-400 flex items-center gap-2">
                      <Shield className="w-3 h-3 text-green-500" />
                      localhost:3000
                    </div>
                  </div>
                </div>

                {/* Report Mode Selection UI */}
                <div className="p-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">What would you like to do?</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="group cursor-pointer">
                      <div className="p-4 rounded-xl bg-coral-50 dark:bg-coral-900/20 border-2 border-coral-200 dark:border-coral-700 text-center hover:scale-105 transition-transform">
                        <span className="text-2xl block mb-1">🐛</span>
                        <span className="text-xs font-medium text-coral-700 dark:text-coral-300">Bug Report</span>
                      </div>
                    </div>
                    <div className="group cursor-pointer">
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 text-center hover:scale-105 transition-transform">
                        <span className="text-2xl block mb-1">💡</span>
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Feedback</span>
                      </div>
                    </div>
                    <div className="group cursor-pointer">
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-500 text-center scale-105 ring-2 ring-blue-500/50">
                        <span className="text-2xl block mb-1">✏️</span>
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Edit / Change</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Element Preview */}
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Selected Element</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-mono text-blue-700 dark:text-blue-300">&lt;button&gt;.submit-btn</div>
                      <span className="text-xs text-slate-400">Login Form</span>
                    </div>
                  </div>

                  {/* AI Launch Button */}
                  <div className="mt-4">
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-coral-600 hover:to-coral-700 transition-all shadow-lg shadow-coral-500/25">
                      <Terminal className="w-5 h-5" />
                      Launch Claude Code
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-slate-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Three Report Modes Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
              <Layers className="w-4 h-4" />
              Three Ways to Communicate
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              More than bug tracking
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Report issues, suggest improvements, or request changes. Each mode generates tailored AI prompts for Claude Code.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                emoji: '🐛',
                title: 'Bug Report',
                subtitle: 'Something broken?',
                desc: 'Report bugs with full context—screenshots, console logs, network errors, and element selectors. AI finds the root cause.',
                bgColor: '#FEE2E2',
                borderColor: 'border-coral-200 dark:border-coral-800',
                features: ['Auto error capture', 'Stack traces', 'AI root cause analysis']
              },
              {
                emoji: '💡',
                title: 'Feedback / Suggestion',
                subtitle: 'Have an idea?',
                desc: 'Submit feature requests, UX improvements, or general feedback. AI evaluates feasibility and implementation approach.',
                bgColor: '#FEF3C7',
                borderColor: 'border-amber-200 dark:border-amber-800',
                features: ['Feature requests', 'UX suggestions', 'AI feasibility check']
              },
              {
                emoji: '✏️',
                title: 'Edit / Change',
                subtitle: 'Want something different?',
                desc: 'Select elements and describe what you want changed. AI generates specific code modifications.',
                bgColor: '#DBEAFE',
                borderColor: 'border-blue-200 dark:border-blue-800',
                features: ['Visual selection', 'Element targeting', 'Direct code changes']
              },
            ].map((mode, i) => (
              <Card key={i} className={`p-6 border-2 ${mode.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: mode.bgColor }}
                  >
                    <span className="text-3xl">{mode.emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-slate-900 dark:text-white">{mode.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{mode.subtitle}</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{mode.desc}</p>
                <ul className="space-y-2">
                  {mode.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Claude Code Terminal Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coral-50 via-white to-amber-50 dark:from-coral-950/20 dark:via-slate-900 dark:to-amber-950/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
                <Terminal className="w-4 h-4" />
                The Magic Part
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                One click. Claude Code. Fixed.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Click &quot;Launch Claude Code&quot; and we handle the rest. Terminal opens, Claude Code starts,
                and the full context—bug details, screenshot, element selectors—is automatically pasted.
                Claude analyzes and implements the fix.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Terminal, text: 'Opens Terminal in your project directory' },
                  { icon: Send, text: 'Pastes full context automatically' },
                  { icon: Eye, text: 'Claude sees the screenshot for visual context' },
                  { icon: CheckCircle, text: 'Webhook notifies you when done' },
                  { icon: Wand2, text: 'Terminal closes automatically after fix' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-coral-600 dark:text-coral-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Preview */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-coral-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />

              <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-slate-400 text-sm font-mono ml-2">Terminal — claude</span>
                </div>
                <div className="p-6 font-mono text-sm space-y-3">
                  <p className="text-slate-400">
                    <span className="text-green-400">$</span> <span className="text-white">cd ~/projects/my-app && claude</span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    <span className="text-coral-400">🐛 BugRadar:</span> Starting Claude Code...
                  </p>
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <p className="text-coral-400 text-xs mb-2">━━━ ✏️ Edit / Change Request ━━━</p>
                    <p className="text-slate-300 text-xs">
                      <span className="text-amber-400">Title:</span> Make submit button larger
                    </p>
                    <p className="text-slate-300 text-xs">
                      <span className="text-amber-400">Element:</span> &lt;button&gt;.submit-btn
                    </p>
                    <p className="text-slate-300 text-xs">
                      <span className="text-amber-400">Screenshot:</span> <span className="text-blue-400 underline">Viewing...</span>
                    </p>
                    <p className="text-slate-300 text-xs mt-2">
                      <span className="text-amber-400">Note:</span> User wants the button to be more prominent
                    </p>
                  </div>
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <p className="text-green-400 text-xs animate-pulse">
                      Claude is implementing the change...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
              <Rocket className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              From feedback to fix in minutes
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A seamless workflow from visual selection to AI-powered implementation
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: MousePointer2, title: 'Select & describe', desc: 'Click any element, choose your mode (bug/feedback/edit), and describe what you need.', color: 'coral' },
              { step: 2, icon: Sparkles, title: 'AI enhances', desc: 'Claude AI transforms your input into a professional, actionable report with technical context.', color: 'amber' },
              { step: 3, icon: Terminal, title: 'Launch Claude Code', desc: 'One click opens Terminal, starts Claude Code, and pastes the full context automatically.', color: 'coral' },
              { step: 4, icon: CheckCircle, title: 'Review & ship', desc: 'Claude implements the fix. Terminal closes. Webhook notifies you. Review and deploy.', color: 'green' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                {/* Connector Line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
                )}

                <div className="text-center">
                  {/* Step Icon */}
                  <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                    style={{ backgroundColor: item.color === 'coral' ? '#FEE2E2' : item.color === 'amber' ? '#FEF3C7' : '#D1FAE5' }}>
                    <item.icon className={`w-10 h-10`} style={{ color: item.color === 'coral' ? '#DC2626' : item.color === 'amber' ? '#D97706' : '#059669' }} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center font-bold text-slate-900 dark:text-white text-sm">
                      {item.step}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Integration Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-coral-50/30 to-white dark:from-slate-900 dark:via-coral-950/10 dark:to-slate-900" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium mb-4">
              <Code className="w-4 h-4" />
              Dead Simple Integration
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Two lines. That&apos;s it.
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Add the SDK to your localhost app and start capturing feedback immediately.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Terminal Window */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-slate-400 text-sm font-mono">your-app/src/index.tsx</span>
                </div>
              </div>
              <div className="p-6 font-mono text-sm md:text-base overflow-x-auto">
                <div className="space-y-4">
                  {/* Line 1 */}
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 select-none w-6 text-right">1</span>
                    <div>
                      <span className="text-coral-400">import</span>
                      <span className="text-white"> {'{ '}</span>
                      <span className="text-amber-300">BugRadar</span>
                      <span className="text-white">{' }'} </span>
                      <span className="text-coral-400">from</span>
                      <span className="text-green-400"> &apos;@bugradar/sdk&apos;</span>
                      <span className="text-white">;</span>
                    </div>
                  </div>
                  {/* Line 2 */}
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 select-none w-6 text-right">2</span>
                    <div>
                      <span className="text-amber-300">BugRadar</span>
                      <span className="text-white">.</span>
                      <span className="text-blue-400">init</span>
                      <span className="text-white">(</span>
                      <span className="text-green-400">&apos;br_live_xxxxx&apos;</span>
                      <span className="text-white">);</span>
                    </div>
                  </div>
                  {/* Line 3 - Comment */}
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 select-none w-6 text-right">3</span>
                    <span className="text-slate-500">// Done! Widget appears. Users can report, suggest, or request changes.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Framework Icons */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <span className="text-sm text-slate-500">Works with:</span>
              <div className="flex items-center gap-4">
                {['React', 'Next.js', 'Vue', 'Svelte', 'Angular'].map((fw) => (
                  <div key={fw} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default">
                    {fw}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative bg-slate-50 dark:bg-slate-800/50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Everything captured. Nothing lost.
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive context for every report
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Camera, title: 'Visual Selection', desc: 'Click any element on the page. Capture screenshots with annotations. Visual context for every report.', gradient: 'from-coral-500 to-red-600' },
              { icon: Sparkles, title: 'AI Enhancement', desc: 'Claude AI transforms casual descriptions into professional, technical reports with actionable details.', gradient: 'from-amber-500 to-orange-600' },
              { icon: Terminal, title: 'Claude Code Integration', desc: 'One-click launches Claude Code with full context. AI analyzes and implements fixes automatically.', gradient: 'from-coral-500 to-red-600' },
              { icon: Bug, title: 'Auto Error Capture', desc: 'JavaScript errors automatically become reports. Stack traces, console logs, network data included.', gradient: 'from-green-500 to-emerald-600' },
              { icon: Target, title: 'Element Selectors', desc: 'CSS selectors and XPath captured for every selected element. Claude knows exactly what to fix.', gradient: 'from-blue-500 to-cyan-600' },
              { icon: Zap, title: '2-Line Setup', desc: 'npm install, two lines of code, done. Works with any JavaScript framework on localhost.', gradient: 'from-amber-500 to-orange-600' },
            ].map((feature, i) => (
              <Card key={i} className="group p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-700 overflow-hidden relative">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 border border-coral-500/30 rounded-full" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-coral-500/20 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-coral-500/10 rounded-2xl rotate-45" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-500/20 text-coral-400 text-sm font-medium mb-4">
              <MessageSquare className="w-4 h-4" />
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Loved by developers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Chen', role: 'Frontend Lead', quote: 'The Claude Code integration is insane. Report a bug, click launch, and Claude just... fixes it. We went from hours to minutes.', avatar: 'S' },
              { name: 'Marcus Johnson', role: 'Indie Hacker', quote: 'Finally something that\'s not just about bugs. The feedback and edit modes are perfect for solo dev iteration.', avatar: 'M' },
              { name: 'Elena Rodriguez', role: 'CTO @ Startup', quote: 'We use this for internal testing. QA reports an issue, devs click Launch Claude Code. It\'s that simple.', avatar: 'E' },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 bg-slate-800 border-slate-700 hover:border-coral-500/50 transition-colors">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4" />
              Simple Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Start free, scale as you grow
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              No credit card required. Upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                desc: 'Perfect for side projects',
                features: ['50 reports/month', '10 AI credits', '2 projects', '3 team members', 'Community support'],
                cta: 'Get Started',
                popular: false
              },
              {
                name: 'Team',
                price: '$99',
                period: '/month',
                desc: 'For larger organizations',
                features: ['Unlimited reports', '200 AI credits', 'Unlimited projects', '25 team members', 'API access', 'Custom branding', 'Priority support'],
                cta: 'Start Free Trial',
                popular: true
              },
            ].map((plan, i) => (
              <Card key={i} className={`p-8 relative transition-all duration-300 hover:shadow-xl ${plan.popular ? 'border-2 border-coral-500 shadow-xl scale-105 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 hover:-translate-y-1'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white text-sm font-medium rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.desc}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button variant={plan.popular ? 'default' : 'outline'} className="w-full group">
                    {plan.cta}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Self-Hosted Option */}
          <Card className="mt-12 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 max-w-3xl mx-auto">
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
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">$99</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">one-time activation</span>
                  </div>
                  <Link href="/signup">
                    <Button>
                      Get Started
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-coral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob-slow" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-500/20 text-coral-400 text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Ready to streamline development?
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Point. Click.<br />
            <span className="text-coral-400">Claude fixes it.</span>
          </h2>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Visual feedback meets AI-powered fixes. Setup in 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-base px-10 bg-coral-500 hover:bg-coral-600 group">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="ghost" size="lg" className="text-base px-10 text-white hover:bg-white/10">
                Read the Docs
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            No credit card required • Free forever tier • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">BugRadar</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Visual feedback + AI fixes for localhost development.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="text-slate-400 hover:text-white text-sm transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="text-slate-400 hover:text-white text-sm transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-slate-400 hover:text-white text-sm transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-slate-400 hover:text-white text-sm transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">Terms</Link></li>
                <li><Link href="/security" className="text-slate-400 hover:text-white text-sm transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} BugRadar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
