'use client'

import { useOnboardingStore } from '@/stores/onboarding-store'
import { ProgressSteps } from '@/components/onboarding/progress-steps'
import { StepSkillLevel } from './steps/step-skill-level'
import { StepOrganization } from './steps/step-organization'
import { StepPlan } from './steps/step-plan'
import { StepProject } from './steps/step-project'
import { StepApiKey } from './steps/step-api-key'
import { StepTest } from './steps/step-test'

const steps = [
  { title: 'Experience', description: 'Your skill level' },
  { title: 'Organization', description: 'Create your workspace' },
  { title: 'Services', description: 'Connect your accounts' },
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
        totalSteps={6}
        steps={steps}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {currentStep === 1 && <StepSkillLevel />}
        {currentStep === 2 && <StepOrganization />}
        {currentStep === 3 && <StepPlan />}
        {currentStep === 4 && <StepProject />}
        {currentStep === 5 && <StepApiKey />}
        {currentStep === 6 && <StepTest />}
      </div>
    </div>
  )
}
