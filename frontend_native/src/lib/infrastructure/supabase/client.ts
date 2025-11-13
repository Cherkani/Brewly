/**
 * Supabase Client
 * Singleton instance of Supabase client for React Native
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Get environment variables from app.json or process.env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * SecureStore adapter for Supabase auth
 * Stores tokens securely on device
 */
const ExpoSecureStoreAdapter: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
} = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Handle error silently
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Handle error silently
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Get current user context
 */
export async function getCurrentUserContext() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Get user's roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role, org_id, store_id')
    .eq('user_id', user.id);

  return {
    user,
    roles: userRoles || [],
  };
}

