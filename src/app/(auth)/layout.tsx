import { Bug } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-coral-500 rounded-lg flex items-center justify-center">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold">BugRadar</span>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Bug tracking that<br />
            <span className="text-coral-400">doesn&apos;t suck</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Add AI-powered bug tracking to your app with 2 lines of code.
            Your users report bugs visually. AI helps you fix them.
          </p>

          {/* Code Preview */}
          <div className="bg-slate-800 rounded-xl p-4 max-w-md font-mono text-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <pre className="text-slate-300">
              <span className="text-coral-400">npm install</span> bugradar{'\n\n'}
              <span className="text-blue-400">import</span> {'{ BugRadar }'} <span className="text-blue-400">from</span> <span className="text-green-400">&apos;bugradar&apos;</span>;{'\n'}
              BugRadar.<span className="text-yellow-400">init</span>(<span className="text-green-400">&apos;your-key&apos;</span>);
            </pre>
          </div>
        </div>

        {/* Bottom - Social Proof */}
        <div className="relative z-10">
          <p className="text-slate-500 text-sm">
            Trusted by developers at
          </p>
          <div className="flex items-center gap-6 mt-3 text-slate-400">
            <span className="font-medium">Vercel</span>
            <span className="font-medium">Stripe</span>
            <span className="font-medium">Linear</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 justify-center">
              <div className="w-10 h-10 bg-coral-500 rounded-lg flex items-center justify-center">
                <Bug className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">BugRadar</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
