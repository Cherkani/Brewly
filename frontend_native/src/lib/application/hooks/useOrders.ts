/**
 * useOrders Hook
 * Order management operations and state
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { OrderRepository } from '@infrastructure/supabase/repositories/OrderRepository';
import { CreateOrderUseCase } from '@domain/use-cases/CreateOrderUseCase';
import { UpdateOrderStatusUseCase } from '@domain/use-cases/UpdateOrderStatusUseCase';
import type { CreateOrderDTO } from '@domain/repositories/IOrderRepository';
import type { OrderStatus } from '@domain/entities/Order';

const orderRepository = new OrderRepository();
const createOrderUseCase = new CreateOrderUseCase(orderRepository);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

export function useOrders(status?: OrderStatus, limit: number = 50) {
  const queryClient = useQueryClient();
  const { currentLocation } = useAppStore();

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['orders', currentLocation?.id, status, limit],
    queryFn: () =>
      currentLocation
        ? orderRepository.findByLocation(currentLocation.id, status, limit)
        : Promise.resolve([]),
    enabled: !!currentLocation,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Subscribe to order updates
  useEffect(() => {
    if (!currentLocation) return;

    const unsubscribe = orderRepository.subscribeToOrders(
      currentLocation.id,
      () => {
        // Invalidate orders query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['orders', currentLocation.id] });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentLocation, queryClient]);

  return {
    orders,
    loading: isLoading,
    error,
    refetch,
  };
}

export function useOrder(orderId: string | null) {
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () =>
      orderId ? orderRepository.findById(orderId) : Promise.resolve(null),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    order,
    loading: isLoading,
    error,
    refetch,
  };
}

export function useOrderStats(date?: Date) {
  const { currentLocation } = useAppStore();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['orders', 'stats', currentLocation?.id, date?.toISOString()],
    queryFn: () =>
      currentLocation
        ? orderRepository.getStats(currentLocation.id, date)
        : Promise.resolve({
            queued: 0,
            in_progress: 0,
            ready: 0,
            paid: 0,
            completed: 0,
            cancelled: 0,
          }),
    enabled: !!currentLocation,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    stats: stats || {
      queued: 0,
      in_progress: 0,
      ready: 0,
      paid: 0,
      completed: 0,
      cancelled: 0,
    },
    loading: isLoading,
    error,
  };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { currentLocation } = useAppStore();

  const mutation = useMutation({
    mutationFn: (data: CreateOrderDTO) => createOrderUseCase.execute(data),
    onSuccess: () => {
      // Invalidate orders queries
      queryClient.invalidateQueries({
        queryKey: ['orders', currentLocation?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['orders', 'stats', currentLocation?.id],
      });
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { currentLocation } = useAppStore();

  const mutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatusUseCase.execute(orderId, status),
    onSuccess: (order) => {
      // Update the order in cache
      queryClient.setQueryData(['orders', order.id], order);
      // Invalidate orders queries
      queryClient.invalidateQueries({
        queryKey: ['orders', currentLocation?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['orders', 'stats', currentLocation?.id],
      });
    },
  });

  return {
    updateStatus: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

