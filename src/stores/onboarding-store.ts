import { create } from 'zustand'

export interface OnboardingData {
  // Step 1: Organization
  organization: {
    name: string
    slug: string
    role: string
  } | null

  // Step 2: Project
  project: {
    name: string
    platform: 'web' | 'mobile' | 'desktop'
    framework: string | null
  } | null

  // Step 3: API Keys (generated after project creation)
  apiKeys: {
    development: string
    production: string
  } | null

  // Step 4: Test result
  testCompleted: boolean
}

interface OnboardingStore {
  currentStep: number
  data: OnboardingData

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  setOrganization: (org: OnboardingData['organization']) => void
  setProject: (project: OnboardingData['project']) => void
  setApiKeys: (keys: OnboardingData['apiKeys']) => void
  setTestCompleted: (completed: boolean) => void

  reset: () => void
}

const initialData: OnboardingData = {
  organization: null,
  project: null,
  apiKeys: null,
  testCompleted: false,
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  data: initialData,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  setOrganization: (org) => set((state) => ({
    data: { ...state.data, organization: org }
  })),
  setProject: (project) => set((state) => ({
    data: { ...state.data, project: project }
  })),
  setApiKeys: (keys) => set((state) => ({
    data: { ...state.data, apiKeys: keys }
  })),
  setTestCompleted: (completed) => set((state) => ({
    data: { ...state.data, testCompleted: completed }
  })),

  reset: () => set({ currentStep: 1, data: initialData }),
}))
