'use client'

import { useOnboardingStore } from '@/stores/onboarding-store'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { StepPlan } from './steps/step-plan'
import { StepComplete } from './steps/step-complete'

// Simplified onboarding for self-hosted: just connect services
const steps = [
  { title: 'Services', description: 'Connect your accounts' },
  { title: 'Complete', description: 'Ready to go' },
]

export function OnboardingWizard() {
  const { currentStep } = useOnboardingStore()

  return (
    <div className="animate-fade-in">
      <ProgressSteps
        currentStep={currentStep}
        totalSteps={2}
        steps={steps}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {currentStep === 1 && <StepPlan />}
        {currentStep === 2 && <StepComplete />}
      </div>
    </div>
  )
}
