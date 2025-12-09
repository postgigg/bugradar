'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, Bug, ArrowRight, Github } from 'lucide-react'

export function StepComplete() {
  const router = useRouter()

  return (
    <div className="p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
        Setup Complete!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Your self-hosted BugRadar instance is ready. Your data is stored on your own infrastructure.
      </p>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 max-w-lg mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center">
            <Bug className="w-5 h-5 text-coral-600 dark:text-coral-400" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-slate-900 dark:text-white">BugRadar</h3>
            <p className="text-sm text-slate-500">Self-Hosted Instance</p>
          </div>
        </div>

        <ul className="text-left space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Supabase connected
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Anthropic AI ready
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Resend email configured
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={() => router.push('/dashboard')}>
          Open Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <a href="https://github.com/postgigg/bugradar" target="_blank">
          <Button size="lg" variant="outline">
            <Github className="w-4 h-4 mr-2" />
            View Source
          </Button>
        </a>
      </div>
    </div>
  )
}
