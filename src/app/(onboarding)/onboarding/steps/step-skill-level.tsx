'use client'

import { useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { Button } from '@/components/ui/button'
import { setSkillLevel } from '@/components/ui/butterfly-help'
import { ArrowRight, Rocket, GraduationCap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// Butterfly SVG for decoration
function ButterflyDecor({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("w-8 h-8", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 12C12 12 8 8 4 10C0 12 2 18 6 18C10 18 12 14 12 12Z"
        fill="currentColor"
        className="text-coral-400"
      />
      <path
        d="M12 12C12 12 16 8 20 10C24 12 22 18 18 18C14 18 12 14 12 12Z"
        fill="currentColor"
        className="text-coral-500"
      />
      <path
        d="M12 12C12 12 9 6 6 4C3 2 1 6 4 8C7 10 12 12 12 12Z"
        fill="currentColor"
        className="text-amber-400"
      />
      <path
        d="M12 12C12 12 15 6 18 4C21 2 23 6 20 8C17 10 12 12 12 12Z"
        fill="currentColor"
        className="text-amber-500"
      />
      <ellipse cx="12" cy="14" rx="1" ry="4" fill="currentColor" className="text-slate-700" />
      <circle cx="12" cy="9" r="1.5" fill="currentColor" className="text-slate-700" />
    </svg>
  )
}

export function StepSkillLevel() {
  const { nextStep, setSkillLevelChoice } = useOnboardingStore()
  const [selected, setSelected] = useState<'rookie' | 'pro' | null>(null)

  const handleContinue = () => {
    if (selected) {
      setSkillLevel(selected)
      setSkillLevelChoice(selected)
      nextStep()
    }
  }

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-coral-100 to-amber-100 dark:from-coral-900/30 dark:to-amber-900/30 mb-4">
          <GraduationCap className="w-8 h-8 text-coral-600 dark:text-coral-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          What&apos;s your experience level?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We&apos;ll personalize your experience based on your familiarity with bug tracking tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
        {/* Rookie Option */}
        <button
          onClick={() => setSelected('rookie')}
          className={cn(
            "relative p-6 rounded-xl border-2 text-left transition-all duration-200",
            "hover:shadow-lg hover:-translate-y-0.5",
            selected === 'rookie'
              ? "border-coral-500 bg-coral-50 dark:bg-coral-900/20 shadow-md"
              : "border-slate-200 dark:border-slate-700 hover:border-coral-300 dark:hover:border-coral-700"
          )}
        >
          {selected === 'rookie' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-coral-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-coral-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                I&apos;m New Here
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rookie</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            New to bug tracking or BugRadar? We&apos;ll show you helpful guides throughout the platform.
          </p>

          <div className="flex items-center gap-2 text-sm text-coral-600 dark:text-coral-400">
            <ButterflyDecor className="w-5 h-5" />
            <span>Butterfly guides enabled</span>
          </div>
        </button>

        {/* Pro Option */}
        <button
          onClick={() => setSelected('pro')}
          className={cn(
            "relative p-6 rounded-xl border-2 text-left transition-all duration-200",
            "hover:shadow-lg hover:-translate-y-0.5",
            selected === 'pro'
              ? "border-coral-500 bg-coral-50 dark:bg-coral-900/20 shadow-md"
              : "border-slate-200 dark:border-slate-700 hover:border-coral-300 dark:hover:border-coral-700"
          )}
        >
          {selected === 'pro' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-coral-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                I Know What I&apos;m Doing
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pro</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Experienced with bug tracking tools? Jump right in with a streamlined interface.
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Streamlined experience</span>
          </div>
        </button>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selected}
          size="lg"
          className="px-8"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
