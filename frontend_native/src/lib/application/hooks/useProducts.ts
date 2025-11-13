/**
 * useProducts Hook
 * Product catalog operations and state
 */

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { ProductRepository } from '@infrastructure/supabase/repositories/ProductRepository';

const productRepository = new ProductRepository();

export function useProducts(activeOnly: boolean = true) {
  const { currentLocation } = useAppStore();

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products', currentLocation?.id, activeOnly],
    queryFn: () =>
      currentLocation
        ? productRepository.findByLocation(currentLocation.id, activeOnly)
        : Promise.resolve([]),
    enabled: !!currentLocation,
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
  const { currentLocation } = useAppStore();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories', currentLocation?.id],
    queryFn: () =>
      currentLocation
        ? productRepository.getCategories(currentLocation.id)
        : Promise.resolve([]),
    enabled: !!currentLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    categories,
    loading: isLoading,
    error,
  };
}

export function useProductSearch(query: string) {
  const { currentLocation } = useAppStore();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', 'search', currentLocation?.id, query],
    queryFn: () =>
      currentLocation && query.length >= 2
        ? productRepository.search(currentLocation.id, query)
        : Promise.resolve([]),
    enabled: !!currentLocation && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    products,
    loading: isLoading,
    error,
  };
}

