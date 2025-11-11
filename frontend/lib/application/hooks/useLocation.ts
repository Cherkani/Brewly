/**
 * useLocation Hook
 * Manages location state and syncs with app store
 */

'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'
import { getCurrentUserContext } from '@/lib/infrastructure/supabase/client'
import { supabase } from '@/lib/infrastructure/supabase/client'
import { useAuth } from './useAuth'

export function useLocation() {
  const {
    locations,
    currentLocation,
    setLocations,
    setCurrentLocation,
    currentOrganization,
    setCurrentOrganization,
    setOrganizations,
  } = useAppStore()
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) return

    // In development, prioritize dev context
    if (process.env.NODE_ENV === 'development') {
      const devContext = localStorage.getItem('dev_context')
      if (devContext) {
        const context = JSON.parse(devContext)
        if (context.locationId) {
          // Dev context has location, use it
          syncDevContext()
          setLoading(false)
        } else {
          // No dev location, try user locations
          if (user) {
            initializeLocations()
          } else {
            setLoading(false)
          }
        }
      } else {
        // No dev context, try user locations
        if (user) {
          initializeLocations()
        } else {
          setLoading(false)
        }
      }
    } else {
      // Production: only use user locations
      if (user) {
        initializeLocations()
      } else {
        setLoading(false)
      }
    }

    // Listen for dev context changes in development
    if (process.env.NODE_ENV === 'development') {
      const handleDevContextChange = (event: CustomEvent) => {
        syncDevContextFromEvent(event.detail)
        setLoading(false)
      }

      window.addEventListener(
        'devContextChanged',
        handleDevContextChange as EventListener
      )

      return () => {
        window.removeEventListener(
          'devContextChanged',
          handleDevContextChange as EventListener
        )
      }
    }
  }, [user, authLoading])

  const initializeLocations = async () => {
    try {
      setLoading(true)

      // Load user's actual locations
      const context = await getCurrentUserContext()
      if (!context) {
        setLoading(false)
        return
      }

      // Map organizations
      const orgIds = new Set(context.organizations.map((om) => om.org_id))
      const orgsData = await supabase
        .from('orgs')
        .select('id, name')
        .in('id', Array.from(orgIds))

      if (orgsData.data) {
        setOrganizations(
          orgsData.data.map((org) => ({
            id: org.id,
            name: org.name,
          }))
        )

        // Set current org if only one
        if (orgsData.data.length === 1) {
          setCurrentOrganization({
            id: orgsData.data[0].id,
            name: orgsData.data[0].name,
          })
        }
      }

      // Map locations from location members
      const locationData = context.locations.map((lm: any) => ({
        id: lm.locations.id,
        name: lm.locations.name,
        orgId: lm.locations.org_id,
        address: lm.locations.address,
        timezone: lm.locations.timezone || 'UTC',
        isActive: true,
      }))

      setLocations(locationData)

      // Set current location if only one, or restore from persisted state
      if (locationData.length === 1) {
        setCurrentLocation(locationData[0])
      } else if (currentLocation && locationData.find((l) => l.id === currentLocation.id)) {
        // Keep current location if it's still valid
        const validLocation = locationData.find((l) => l.id === currentLocation.id)
        if (validLocation) {
          setCurrentLocation(validLocation)
        }
      }
    } catch (error) {
      console.error('Error initializing locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncDevContext = async () => {
    if (process.env.NODE_ENV !== 'development') return

    const devContext = localStorage.getItem('dev_context')
    if (!devContext) return

    try {
      const context = JSON.parse(devContext)
      await syncDevContextFromEvent(context)
    } catch (error) {
      console.error('Error syncing dev context:', error)
    }
  }

  const syncDevContextFromEvent = async (context: {
    orgId: string | null
    locationId: string | null
  }) => {
    if (process.env.NODE_ENV !== 'development') return

    try {
      // Load org if selected
      if (context.orgId) {
        const { data: orgData } = await supabase
          .from('orgs')
          .select('id, name')
          .eq('id', context.orgId)
          .single()

        if (orgData) {
          setCurrentOrganization({
            id: orgData.id,
            name: orgData.name,
          })
        }
      }

      // Load location if selected
      if (context.locationId) {
        const { data: locationData } = await supabase
          .from('locations')
          .select('id, name, org_id, address, timezone, is_active')
          .eq('id', context.locationId)
          .single()

        if (locationData) {
          setCurrentLocation({
            id: locationData.id,
            name: locationData.name,
            orgId: locationData.org_id,
            address: locationData.address,
            timezone: locationData.timezone || 'UTC',
            isActive: locationData.is_active ?? true,
          })

          // Also update locations array if not already present
          const existingLocation = locations.find((l) => l.id === locationData.id)
          if (!existingLocation) {
            setLocations([
              ...locations,
              {
                id: locationData.id,
                name: locationData.name,
                orgId: locationData.org_id,
                address: locationData.address,
                timezone: locationData.timezone || 'UTC',
                isActive: locationData.is_active ?? true,
              },
            ])
          }
        }
      } else {
        // Clear location if dev context has no location
        setCurrentLocation(null)
      }
    } catch (error) {
      console.error('Error syncing dev context to app store:', error)
    }
  }

  return {
    locations,
    currentLocation,
    loading,
    setCurrentLocation,
  }
}

