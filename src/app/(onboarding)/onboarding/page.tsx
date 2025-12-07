import { Metadata } from 'next'
import { OnboardingWizard } from './onboarding-wizard'

export const metadata: Metadata = {
  title: 'Setup | BugRadar',
  description: 'Set up your BugRadar workspace',
}

export default function OnboardingPage() {
  return <OnboardingWizard />
}
