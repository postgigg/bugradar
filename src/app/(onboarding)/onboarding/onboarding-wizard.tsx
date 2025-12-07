'use client'

import { useOnboardingStore } from '@/stores/onboarding-store'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { StepOrganization } from './steps/step-organization'
import { StepProject } from './steps/step-project'
import { StepApiKey } from './steps/step-api-key'
import { StepTest } from './steps/step-test'

const steps = [
  { title: 'Organization', description: 'Create your workspace' },
  { title: 'Project', description: 'Set up your first project' },
  { title: 'Install', description: 'Get your API key' },
  { title: 'Test', description: 'Verify installation' },
]

export function OnboardingWizard() {
  const { currentStep } = useOnboardingStore()

  return (
    <div className="animate-fade-in">
      <ProgressSteps
        currentStep={currentStep}
        totalSteps={4}
        steps={steps}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {currentStep === 1 && <StepOrganization />}
        {currentStep === 2 && <StepProject />}
        {currentStep === 3 && <StepApiKey />}
        {currentStep === 4 && <StepTest />}
      </div>
    </div>
  )
}
