/**
 * App Store
 * Global application state management with Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Organization {
  id: string
  name: string
}

interface Location {
  id: string
  name: string
  orgId: string
  address: string | null
  timezone: string
  isActive: boolean
}

interface User {
  id: string
  email: string
  role: 'owner' | 'admin' | 'cashier' | 'superuser'
}

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void

  // Organizations
  organizations: Organization[]
  currentOrganization: Organization | null
  setOrganizations: (orgs: Organization[]) => void
  setCurrentOrganization: (org: Organization | null) => void

  // Locations
  locations: Location[]
  currentLocation: Location | null
  setLocations: (locations: Location[]) => void
  setCurrentLocation: (location: Location | null) => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Loading state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Reset
  reset: () => void
}

const initialState = {
  user: null,
  organizations: [],
  currentOrganization: null,
  locations: [],
  currentLocation: null,
  sidebarOpen: true,
  isLoading: false,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setOrganizations: (organizations) => set({ organizations }),
      
      setCurrentOrganization: (currentOrganization) =>
        set({ currentOrganization }),

      setLocations: (locations) => set({ locations }),
      
      setCurrentLocation: (currentLocation) => set({ currentLocation }),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setIsLoading: (isLoading) => set({ isLoading }),

      reset: () => set(initialState),
    }),
    {
      name: 'brewly-app-store',
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
        currentLocation: state.currentLocation,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)

