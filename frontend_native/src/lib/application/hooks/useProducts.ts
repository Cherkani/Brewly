/**
 * useProducts Hook
 * Product catalog operations and state
 */

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { ProductRepository } from '@infrastructure/supabase/repositories/ProductRepository';

const productRepository = new ProductRepository();

export function useProducts(activeOnly: boolean = true) {
  const { currentStore } = useAppStore();

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products', currentStore?.id, activeOnly],
    queryFn: async () => {
      if (!currentStore) return [];

      try {
        return await productRepository.findByStore(currentStore.id, activeOnly);
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    enabled: !!currentStore,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    products,
    loading: isLoading,
    error,
    refetch,
  };
}

export function useProduct(productId: string | null) {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['products', productId],
    queryFn: () =>
      productId
        ? productRepository.findById(productId)
        : Promise.resolve(null),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    product,
    loading: isLoading,
    error,
  };
}

export function useCategories() {
  const { currentStore } = useAppStore();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories', currentStore?.id],
    queryFn: () =>
      currentStore
        ? productRepository.getCategories(currentStore.id)
        : Promise.resolve([]),
    enabled: !!currentStore,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    categories,
    loading: isLoading,
    error,
  };
}

export function useProductSearch(query: string) {
  const { currentStore } = useAppStore();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', 'search', currentStore?.id, query],
    queryFn: () =>
      currentStore && query.length >= 2
        ? productRepository.search(currentStore.id, query)
        : Promise.resolve([]),
    enabled: !!currentStore && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    products,
    loading: isLoading,
    error,
  };
}
