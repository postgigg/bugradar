'use client'

import { useOnboardingStore } from '@/stores/onboarding-store'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { StepOrganization } from './steps/step-organization'
import { StepPlan } from './steps/step-plan'
import { StepProject } from './steps/step-project'
import { StepApiKey } from './steps/step-api-key'
import { StepTest } from './steps/step-test'

const steps = [
  { title: 'Organization', description: 'Create your workspace' },
  { title: 'Plan', description: 'Choose your plan' },
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
        totalSteps={5}
        steps={steps}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {currentStep === 1 && <StepOrganization />}
        {currentStep === 2 && <StepPlan />}
        {currentStep === 3 && <StepProject />}
        {currentStep === 4 && <StepApiKey />}
        {currentStep === 5 && <StepTest />}
      </div>
    </div>
  )
}
