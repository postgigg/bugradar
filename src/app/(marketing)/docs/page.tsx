import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Code2, Sparkles, Bug, Lightbulb, PenLine, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodeBlock } from '@/components/docs/code-block'

export const metadata: Metadata = {
  title: 'Documentation | BugRadar SDK',
  description: 'Complete guide to integrating BugRadar SDK into your application',
}

export default function DocsPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>BugRadar SDK Documentation</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Introduction
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          AI-powered bug tracking SDK. Capture bugs visually with 2 lines of code.
        </p>
      </div>

      {/* Quick Start */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Quick Start
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Get BugRadar up and running in your application in under 2 minutes.
        </p>

        <CodeBlock
          code={`npm install bugradar`}
          language="bash"
          filename="terminal"
          showLineNumbers={false}
        />

        <CodeBlock
          code={`import { BugRadar } from 'bugradar';

BugRadar.init('br_live_your_api_key');

// That's it! AI-powered bug tracking is now active.`}
          language="typescript"
          filename="src/index.tsx"
        />

        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100 mb-1">You're all set!</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Users can now click the bug button to report issues visually. The SDK automatically captures screenshots, console logs, network requests, and browser context.
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          What You Get
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: Zap,
              title: 'Visual Bug Reporting',
              desc: 'Users click elements, capture screenshots, and describe issues',
              color: 'coral'
            },
            {
              icon: Sparkles,
              title: 'AI Enhancement',
              desc: 'Claude AI transforms reports into actionable bug tickets',
              color: 'amber'
            },
            {
              icon: Shield,
              title: 'Auto Error Capture',
              desc: 'JavaScript errors automatically become bug reports',
              color: 'green'
            },
            {
              icon: Code2,
              title: 'Full Context',
              desc: 'Screenshots, console logs, network logs, device info',
              color: 'amber'
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

      {/* Three Report Modes */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Three Report Modes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Choose the right mode for what you&apos;re reporting. Each generates tailored AI prompts.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              emoji: '🐛',
              title: 'Bug Report',
              desc: 'Report broken functionality with error context',
              color: 'coral'
            },
            {
              emoji: '💡',
              title: 'Feedback / Suggestion',
              desc: 'Submit feature ideas and improvements',
              color: 'amber'
            },
            {
              emoji: '✏️',
              title: 'Edit / Change',
              desc: 'Request specific modifications to elements',
              color: 'blue'
            },
          ].map((mode, i) => (
            <Card key={i} className="p-4 hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{mode.emoji}</span>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {mode.title}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {mode.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Claude Code Integration */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
          <Terminal className="w-6 h-6 text-coral-500" />
          Claude Code Integration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          One-click to launch Claude Code with full bug context in your terminal. The dashboard includes a
          &quot;Launch Claude Code&quot; button that:
        </p>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <span className="text-coral-500">•</span>
            Auto-opens Terminal with your project directory
          </li>
          <li className="flex items-center gap-2">
            <span className="text-coral-500">•</span>
            Starts Claude Code and pastes the full bug context
          </li>
          <li className="flex items-center gap-2">
            <span className="text-coral-500">•</span>
            Includes screenshot URL so Claude can view the visual context
          </li>
          <li className="flex items-center gap-2">
            <span className="text-coral-500">•</span>
            Sends webhook notification when the fix is complete
          </li>
        </ul>
        <div className="mt-4 p-4 bg-coral-50 dark:bg-coral-900/20 border border-coral-200 dark:border-coral-800 rounded-xl">
          <p className="text-sm text-coral-700 dark:text-coral-300">
            <strong>Note:</strong> Claude Code integration requires macOS. Accessibility permissions must be granted for Terminal automation.
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Next Steps
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/docs/installation" className="group">
            <Card className="p-6 h-full hover:shadow-xl hover:border-coral-500 dark:hover:border-coral-500 transition-all duration-300 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-coral-500 transition-colors flex items-center gap-2">
                Installation Guide
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Detailed installation instructions for all JavaScript frameworks and environments.
              </p>
            </Card>
          </Link>

          <Link href="/docs/configuration" className="group">
            <Card className="p-6 h-full hover:shadow-xl hover:border-coral-500 dark:hover:border-coral-500 transition-all duration-300 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-coral-500 transition-colors flex items-center gap-2">
                Configuration Options
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Learn about all available configuration options to customize BugRadar for your needs.
              </p>
            </Card>
          </Link>

          <Link href="/docs/api-reference" className="group">
            <Card className="p-6 h-full hover:shadow-xl hover:border-coral-500 dark:hover:border-coral-500 transition-all duration-300 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-coral-500 transition-colors flex items-center gap-2">
                API Reference
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Complete API documentation for all SDK methods and configuration options.
              </p>
            </Card>
          </Link>

          <Link href="/docs/examples" className="group">
            <Card className="p-6 h-full hover:shadow-xl hover:border-coral-500 dark:hover:border-coral-500 transition-all duration-300 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-coral-500 transition-colors flex items-center gap-2">
                Code Examples
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Real-world examples for React, Next.js, Vue, Svelte, and more.
              </p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Get Help */}
      <div className="not-prose">
        <Card className="p-6 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Check out our troubleshooting guide or reach out to our support team.
          </p>
          <div className="flex gap-3">
            <Link href="/docs/troubleshooting">
              <Button variant="outline" size="sm">
                Troubleshooting
              </Button>
            </Link>
            <a href="mailto:support@bugradar.io">
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
