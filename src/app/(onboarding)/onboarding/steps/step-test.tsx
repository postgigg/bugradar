'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { createClient } from '@/lib/supabase/client'
import {
  Copy, Check, ArrowLeft, Radar,
  CheckCircle, PartyPopper, SkipForward
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function StepTest() {
  const router = useRouter()
  const { prevStep, data, setTestCompleted } = useOnboardingStore()
  const [isWaiting, setIsWaiting] = useState(false)
  const [testReceived, setTestReceived] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const supabase = createClient()
  const testCommand = 'BugRadar.test();'

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(testCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Start waiting for test bug
  const startWaiting = () => {
    setIsWaiting(true)
  }

  // Simulate test received (in production, this would be a realtime subscription)
  useEffect(() => {
    if (isWaiting && !testReceived) {
      // In production, use Supabase realtime to listen for bugs
      // For demo, simulate after 3 seconds
      const timer = setTimeout(() => {
        setTestReceived(true)
        setTestCompleted(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isWaiting, testReceived, setTestCompleted])

  // Finish onboarding
  const finishOnboarding = async () => {
    setIsFinishing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', user.id)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error finishing onboarding:', error)
      setIsFinishing(false)
    }
  }

  // Skip test
  const skipTest = async () => {
    setIsFinishing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', user.id)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      setIsFinishing(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Test your integration
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Let&apos;s make sure everything is working correctly
        </p>
      </div>

      {!testReceived ? (
        <>
          {/* Test Command */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Add this to trigger a test bug:
            </span>

            <div className="relative">
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="p-4 font-mono text-sm text-slate-100">
                  <span className="text-coral-400">BugRadar</span>
                  <span className="text-slate-100">.</span>
                  <span className="text-yellow-400">test</span>
                  <span className="text-slate-100">();</span>
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Waiting State */}
          {isWaiting ? (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center">
                  <Radar className="w-10 h-10 text-coral-500 animate-pulse" />
                </div>
                {/* Radar animation rings */}
                <div className="absolute inset-0 rounded-full border-2 border-coral-500/50 animate-ping" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Waiting for test bug...
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Run <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">BugRadar.test()</code> in your app&apos;s console
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <Button onClick={startWaiting}>
                <Radar className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Success State */
        <div className="flex flex-col items-center py-8 space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div className="absolute -top-2 -right-2">
              <PartyPopper className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Bug received!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your integration is working perfectly
            </p>
          </div>

          {/* Test Bug Preview */}
          <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-coral-500" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                  Test Bug
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This is a test bug from BugRadar SDK
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Received just now
                </p>
              </div>
            </div>
          </div>

          <Button onClick={finishOnboarding} isLoading={isFinishing} size="lg">
            Go to Dashboard
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="button" variant="ghost" onClick={prevStep} disabled={isFinishing}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {!testReceived && (
          <Button
            variant="ghost"
            onClick={skipTest}
            disabled={isFinishing}
            className="text-slate-500"
          >
            Skip for now
            <SkipForward className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
