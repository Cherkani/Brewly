/**
 * Supabase Client
 * Singleton instance of Supabase client
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/shared/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

/**
 * Get current user context
 */
export async function getCurrentUserContext() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user's organizations
  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)

  // Get user's locations
  const { data: locationMembers } = await supabase
    .from('location_members')
    .select(`
      location_id,
      role,
      locations (
        id,
        name,
        org_id,
        address,
        timezone
      )
    `)
    .eq('user_id', user.id)

  return {
    user,
    organizations: orgMembers || [],
    locations: locationMembers || [],
  }
}

/**
 * Check if user is superuser
 */
export async function isUserSuperuser(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('platform_superusers')
    .select('user_id')
    .eq('user_id', userId)
    .single()

  return !!data
}

/**
 * Get user's current organization (from local storage or first available)
 */
export function getCurrentOrg(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('currentOrgId')
}

/**
 * Set user's current organization
 */
export function setCurrentOrg(orgId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('currentOrgId', orgId)
}

/**
 * Get user's current location (from local storage or first available)
 */
export function getCurrentLocation(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('currentLocationId')
}

/**
 * Set user's current location
 */
export function setCurrentLocation(locationId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('currentLocationId', locationId)
}

