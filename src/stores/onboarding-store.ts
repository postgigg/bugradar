import { create } from 'zustand'

export interface OnboardingData {
  // Step 1: Organization
  organization: {
    name: string
    slug: string
    role: string
  } | null

  // Organization ID (set after creation)
  organizationId: string | null

  // Step 2: Plan choice
  plan: 'cloud' | 'self-hosted' | null

  // Step 3: Project
  project: {
    name: string
    platform: 'web' | 'mobile' | 'desktop'
    framework: string | null
  } | null

  // Step 4: API Keys (generated after project creation)
  apiKeys: {
    development: string
    production: string
  } | null

  // Step 5: Test result
  testCompleted: boolean
}

interface OnboardingStore {
  currentStep: number
  data: OnboardingData
  organizationId: string | null

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  setOrganization: (org: OnboardingData['organization']) => void
  setOrganizationId: (id: string) => void
  setOrganizationData: (data: { organizationId?: string; plan?: 'cloud' | 'self-hosted' }) => void
  setPlan: (plan: 'cloud' | 'self-hosted') => void
  setProject: (project: OnboardingData['project']) => void
  setApiKeys: (keys: OnboardingData['apiKeys']) => void
  setTestCompleted: (completed: boolean) => void

  reset: () => void
}

const initialData: OnboardingData = {
  organization: null,
  organizationId: null,
  plan: null,
  project: null,
  apiKeys: null,
  testCompleted: false,
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  data: initialData,
  organizationId: null,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  setOrganization: (org) => set((state) => ({
    data: { ...state.data, organization: org }
  })),
  setOrganizationId: (id) => set((state) => ({
    organizationId: id,
    data: { ...state.data, organizationId: id }
  })),
  setOrganizationData: (data) => set((state) => ({
    organizationId: data.organizationId || state.organizationId,
    data: {
      ...state.data,
      organizationId: data.organizationId || state.data.organizationId,
      plan: data.plan || state.data.plan
    }
  })),
  setPlan: (plan) => set((state) => ({
    data: { ...state.data, plan }
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

  reset: () => set({ currentStep: 1, data: initialData, organizationId: null }),
}))
