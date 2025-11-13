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

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentLocation: (location: Location | null) => void;
  setAvailableLocations: (locations: Location[]) => void;
  reset: () => void;
}

type AppStateData = Omit<AppState, 'setUser' | 'setLoading' | 'setCurrentLocation' | 'setAvailableLocations' | 'reset'>;
type SetState = (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void;

const initialState: AppStateData = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentLocation: null,
  availableLocations: [],
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

  reset: () => set(initialState),
}));

