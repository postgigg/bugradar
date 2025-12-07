'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStepsProps {
  currentStep: number
  totalSteps: number
  steps: { title: string; description: string }[]
}

export function ProgressSteps({ currentStep, totalSteps, steps }: ProgressStepsProps) {
  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {steps[currentStep - 1]?.title}
        </span>
      </div>

      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-coral-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  isCompleted && 'bg-coral-500 text-white',
                  isCurrent && 'bg-coral-500 text-white ring-4 ring-coral-100 dark:ring-coral-900/50',
                  !isCompleted && !isCurrent && 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium hidden sm:block',
                  isCurrent ? 'text-coral-600 dark:text-coral-400' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
