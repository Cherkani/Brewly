/**
 * App Store
 * Global application state management
 */

import { create } from 'zustand';
import type { User } from '@domain/entities/User';
import type { Store } from '@domain/entities/Store';

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Store state
  currentStore: Store | null;
  availableStores: Store[];

  // Developer mode (for super admin to bypass RLS)
  developerMode: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentStore: (store: Store | null) => void;
  setAvailableStores: (stores: Store[]) => void;
  setDeveloperMode: (enabled: boolean) => void;
  reset: () => void;
}

type AppStateData = Omit<AppState, 'setUser' | 'setLoading' | 'setCurrentStore' | 'setAvailableStores' | 'setDeveloperMode' | 'reset'>;
type SetState = (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void;

const initialState: AppStateData = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentStore: null,
  availableStores: [],
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

  setCurrentStore: (store: Store | null) =>
    set({
      currentStore: store,
    }),

  setAvailableStores: (stores: Store[]) =>
    set({
      availableStores: stores,
    }),

  setDeveloperMode: (enabled: boolean) =>
    set({
      developerMode: enabled,
    }),

  reset: () => set(initialState),
}));
