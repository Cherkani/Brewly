/**
 * useStore Hook
 * Store management and state
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { StoreRepository } from '@infrastructure/supabase/repositories/StoreRepository';

const storeRepository = new StoreRepository();

export function useStore() {
  const { user, currentStore, availableStores, setCurrentStore, setAvailableStores } =
    useAppStore();

  // Fetch available stores for user
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores', user?.id],
    queryFn: () =>
      user ? storeRepository.findByUser(user.id) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update available stores in store
  useEffect(() => {
    if (stores.length > 0) {
      setAvailableStores(stores);

      // Auto-select first store if none selected
      if (!currentStore && stores.length > 0) {
        setCurrentStore(stores[0]);
      }
    }
  }, [stores, currentStore, setAvailableStores, setCurrentStore]);

  const switchStore = (storeId: string) => {
    const store = availableStores.find((s) => s.id === storeId);
    if (store) {
      setCurrentStore(store);
    }
  };

  return {
    currentStore,
    availableStores,
    switchStore,
    loading: isLoading,
  };
}

