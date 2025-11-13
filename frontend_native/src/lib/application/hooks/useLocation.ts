/**
 * useLocation Hook
 * Location management and state
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { LocationRepository } from '@infrastructure/supabase/repositories/LocationRepository';

const locationRepository = new LocationRepository();

export function useLocation() {
  const { user, currentLocation, availableLocations, setCurrentLocation, setAvailableLocations } =
    useAppStore();

  // Fetch available locations for user
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations', user?.id],
    queryFn: () =>
      user ? locationRepository.findByUser(user.id) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update available locations in store
  useEffect(() => {
    if (locations.length > 0) {
      setAvailableLocations(locations);

      // Auto-select first location if none selected
      if (!currentLocation && locations.length > 0) {
        setCurrentLocation(locations[0]);
      }
    }
  }, [locations, currentLocation, setAvailableLocations, setCurrentLocation]);

  const switchLocation = (locationId: string) => {
    const location = availableLocations.find((loc) => loc.id === locationId);
    if (location) {
      setCurrentLocation(location);
    }
  };

  return {
    currentLocation,
    availableLocations,
    switchLocation,
    loading: isLoading,
  };
}

