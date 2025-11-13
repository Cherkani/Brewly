/**
 * App Store
 * Global application state management
 */

import { create } from 'zustand';
import type { User } from '@domain/entities/User';
import type { Location } from '@domain/entities/Location';

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Location state
  currentLocation: Location | null;
  availableLocations: Location[];

  // Developer mode (for super admin to bypass RLS)
  developerMode: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentLocation: (location: Location | null) => void;
  setAvailableLocations: (locations: Location[]) => void;
  setDeveloperMode: (enabled: boolean) => void;
  reset: () => void;
}

type AppStateData = Omit<AppState, 'setUser' | 'setLoading' | 'setCurrentLocation' | 'setAvailableLocations' | 'setDeveloperMode' | 'reset'>;
type SetState = (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void;

const initialState: AppStateData = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentLocation: null,
  availableLocations: [],
  developerMode: false,
};

export const useAppStore = create<AppState>((set: SetState) => ({
  ...initialState,

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  setCurrentLocation: (location: Location | null) =>
    set({
      currentLocation: location,
    }),

  setAvailableLocations: (locations: Location[]) =>
    set({
      availableLocations: locations,
    }),

  setDeveloperMode: (enabled: boolean) =>
    set({
      developerMode: enabled,
    }),

  reset: () => set(initialState),
}));

