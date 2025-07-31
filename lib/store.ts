import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LLMMode = 'light' | 'medium' | 'hard'

interface FeatureRunState {
  isRunning: boolean
  currentFeature: string | null
  streamedContent: string
  tokens: number | null
  latency: number | null
  error: string | null
}

interface UserPreferences {
  defaultModel: LLMMode
  lastActiveProject: string | null
  lastActiveCase: string | null
}

interface AppState {
  // Feature run state
  featureRun: FeatureRunState
  
  // User preferences
  preferences: UserPreferences
  
  // Actions
  startRun: (feature: string) => void
  updateStream: (content: string) => void
  completeRun: (tokens: number, latency: number) => void
  setError: (error: string) => void
  resetRun: () => void
  
  // Preferences actions
  setDefaultModel: (model: LLMMode) => void
  setLastActiveProject: (projectId: string | null) => void
  setLastActiveCase: (caseId: string | null) => void
}

const initialState: FeatureRunState = {
  isRunning: false,
  currentFeature: null,
  streamedContent: '',
  tokens: null,
  latency: null,
  error: null,
}

const initialPreferences: UserPreferences = {
  defaultModel: 'light',
  lastActiveProject: null,
  lastActiveCase: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      featureRun: initialState,
      preferences: initialPreferences,

      // Feature run actions
      startRun: (feature: string) =>
        set((state) => ({
          featureRun: {
            ...initialState,
            isRunning: true,
            currentFeature: feature,
          },
        })),

      updateStream: (content: string) =>
        set((state) => ({
          featureRun: {
            ...state.featureRun,
            streamedContent: content,
          },
        })),

      completeRun: (tokens: number, latency: number) =>
        set((state) => ({
          featureRun: {
            ...state.featureRun,
            isRunning: false,
            tokens,
            latency,
          },
        })),

      setError: (error: string) =>
        set((state) => ({
          featureRun: {
            ...state.featureRun,
            isRunning: false,
            error,
          },
        })),

      resetRun: () =>
        set((state) => ({
          featureRun: initialState,
        })),

      // Preferences actions
      setDefaultModel: (model: LLMMode) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            defaultModel: model,
          },
        })),

      setLastActiveProject: (projectId: string | null) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            lastActiveProject: projectId,
          },
        })),

      setLastActiveCase: (caseId: string | null) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            lastActiveCase: caseId,
          },
        })),
    }),
    {
      name: 'debatica-store',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
) 