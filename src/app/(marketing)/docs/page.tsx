import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Code2, Sparkles, Bug, Terminal, Github, Database, Mail, Bot, Server, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/docs/code-block'

export const metadata: Metadata = {
  title: 'Documentation | BugRadar',
  description: 'Complete guide to self-hosting BugRadar',
}

export default function DocsPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
          <Github className="w-4 h-4" />
          <span>Open Source & Self-Hosted</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Getting Started
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Self-hosted bug tracking with AI. Free forever. Your data stays on your infrastructure.
        </p>
      </div>

      {/* Why Self-Hosted */}
      <div className="not-prose mb-12">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: 'Your Data', desc: 'Bugs stored in your Supabase' },
            { icon: Server, title: 'Your Servers', desc: 'Deploy anywhere you want' },
            { icon: Github, title: 'Open Source', desc: 'MIT License, modify freely' },
          ].map((item, i) => (
            <Card key={i} className="p-4 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Prerequisites */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Prerequisites
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Create free accounts with these services:
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Database,
              name: 'Supabase',
              desc: 'Database, auth, storage',
              free: '500MB DB, 1GB storage',
              link: 'https://supabase.com',
              color: 'emerald'
            },
            {
              icon: Bot,
              name: 'Anthropic',
              desc: 'Claude AI for analysis',
              free: '~$0.01 per bug report',
              link: 'https://console.anthropic.com',
              color: 'orange'
            },
            {
              icon: Mail,
              name: 'Resend',
              desc: 'Email notifications',
              free: '100 emails/day free',
              link: 'https://resend.com',
              color: 'blue'
            },
          ].map((service, i) => (
            <Card key={i} className="p-4 border-slate-200 dark:border-slate-700">
              <div className={`w-10 h-10 rounded-lg bg-${service.color}-100 dark:bg-${service.color}-900/30 flex items-center justify-center mb-3`}>
                <service.icon className={`w-5 h-5 text-${service.color}-600 dark:text-${service.color}-400`} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{service.name}</h3>
              <p className="text-sm text-slate-500 mb-2">{service.desc}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mb-3">{service.free}</p>
              <a href={service.link} target="_blank" className="text-coral-500 hover:text-coral-600 text-sm font-medium">
                Get started →
              </a>
            </Card>
          ))}
        </div>
      </div>

      {/* Installation */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Installation
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-coral-500 text-white text-sm flex items-center justify-center">1</span>
              Clone the repository
            </h3>
            <CodeBlock
              code={`git clone https://github.com/postgigg/bugradar.git
cd bugradar`}
              language="bash"
              filename="terminal"
              showLineNumbers={false}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-coral-500 text-white text-sm flex items-center justify-center">2</span>
              Install dependencies
            </h3>
            <CodeBlock
              code={`npm install`}
              language="bash"
              filename="terminal"
              showLineNumbers={false}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-coral-500 text-white text-sm flex items-center justify-center">3</span>
              Configure environment
            </h3>
            <CodeBlock
              code={`cp .env.example .env.local`}
              language="bash"
              filename="terminal"
              showLineNumbers={false}
            />
            <p className="text-sm text-slate-600 dark:text-slate-400 my-3">
              Edit <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">.env.local</code> with your credentials:
            </p>
            <CodeBlock
              code={`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...

# Resend
RESEND_API_KEY=re_...`}
              language="bash"
              filename=".env.local"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-coral-500 text-white text-sm flex items-center justify-center">4</span>
              Set up database
            </h3>
            <CodeBlock
              code={`npx supabase db push`}
              language="bash"
              filename="terminal"
              showLineNumbers={false}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-coral-500 text-white text-sm flex items-center justify-center">5</span>
              Start the app
            </h3>
            <CodeBlock
              code={`npm run dev`}
              language="bash"
              filename="terminal"
              showLineNumbers={false}
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100 mb-1">You&apos;re ready!</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Open <a href="http://localhost:3000" className="underline">http://localhost:3000</a> and complete the onboarding wizard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Features
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: Bug,
              title: 'Visual Bug Reporting',
              desc: 'Screenshot capture with annotation tools',
              color: 'coral'
            },
            {
              icon: Sparkles,
              title: 'AI Enhancement',
              desc: 'Claude AI analyzes and enriches bug reports',
              color: 'amber'
            },
            {
              icon: Zap,
              title: 'Full Context',
              desc: 'Console logs, network requests, browser info',
              color: 'blue'
            },
            {
              icon: Code2,
              title: 'Team Collaboration',
              desc: 'Invite team, assign bugs, track progress',
              color: 'green'
            },
          ].map((feature, i) => (
            <Card key={i} className="p-4 hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-5 h-5 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Deployment */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Deployment
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Deploy BugRadar anywhere you can run a Node.js application.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
              Vercel
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              One-click deploy with automatic builds and previews.
            </p>
            <a href="https://vercel.com/new/clone?repository-url=https://github.com/postgigg/bugradar" target="_blank">
              <Button size="sm">Deploy to Vercel</Button>
            </a>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
              Netlify
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Fork the repo and connect to your Netlify account.
            </p>
            <a href="https://app.netlify.com/start" target="_blank">
              <Button size="sm" variant="outline">Deploy to Netlify</Button>
            </a>
          </Card>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Manual Deployment
          </h3>
          <CodeBlock
            code={`# Build for production
npm run build

# Start production server
npm start`}
            language="bash"
            filename="terminal"
            showLineNumbers={false}
          />
        </div>
      </div>

      {/* Get Help */}
      <div className="not-prose">
        <Card className="p-6 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Check out our GitHub for issues, discussions, and source code.
          </p>
          <div className="flex gap-3">
            <a href="https://github.com/postgigg/bugradar/issues" target="_blank">
              <Button variant="outline" size="sm">
                Report Issue
              </Button>
            </a>
            <a href="https://github.com/postgigg/bugradar/discussions" target="_blank">
              <Button variant="outline" size="sm">
                Discussions
              </Button>
            </a>
            <a href="https://github.com/postgigg/bugradar" target="_blank">
              <Button size="sm">
                <Github className="w-4 h-4 mr-2" />
                View Source
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
