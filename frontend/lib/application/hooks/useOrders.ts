/**
 * useOrders Hook
 * React hook for order operations
 */

'use client'

import { useState, useEffect } from 'react'
import { Order, OrderStatus } from '@/lib/domain/entities/Order'
import { OrderService } from '../services/OrderService'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'

export function useOrders(filters?: {
  status?: OrderStatus
  startDate?: Date
  endDate?: Date
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const orderService = new OrderService()

  useEffect(() => {
    if (!currentLocation) {
      setOrders([])
      setLoading(false)
      return
    }

    loadOrders()
  }, [currentLocation?.id, filters?.status, filters?.startDate, filters?.endDate])

  const loadOrders = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getOrders(currentLocation.id, filters)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadOrders()
  }

  return {
    orders,
    loading,
    error,
    refresh,
  }
}

export function useOrder(id: string | null) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const orderService = new OrderService()

  useEffect(() => {
    if (!id) {
      setOrder(null)
      setLoading(false)
      return
    }

    loadOrder()
  }, [id])

  const loadOrder = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getOrder(id)
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
      console.error('Error loading order:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    order,
    loading,
    error,
    refresh: loadOrder,
  }
}

export function useOrdersByStatus(status: OrderStatus) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const orderService = new OrderService()

  useEffect(() => {
    if (!currentLocation) {
      setOrders([])
      setLoading(false)
      return
    }

    loadOrders()
  }, [currentLocation?.id, status])

  const loadOrders = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getOrdersByStatus(currentLocation.id, status)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    orders,
    loading,
    error,
    refresh: loadOrders,
  }
}

export function useRecentOrders(limit: number = 10) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const orderService = new OrderService()

  useEffect(() => {
    if (!currentLocation) {
      setOrders([])
      setLoading(false)
      return
    }

    loadOrders()
  }, [currentLocation?.id, limit])

  const loadOrders = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getRecentOrders(currentLocation.id, limit)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    orders,
    loading,
    error,
    refresh: loadOrders,
  }
}

export function useOrderStats() {
  const [stats, setStats] = useState<Record<OrderStatus, number>>({
    queued: 0,
    in_progress: 0,
    ready: 0,
    paid: 0,
    completed: 0,
    cancelled: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const orderService = new OrderService()

  useEffect(() => {
    if (!currentLocation) {
      setLoading(false)
      return
    }

    loadStats()
  }, [currentLocation?.id])

  const loadStats = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getOrderCountByStatus(currentLocation.id)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
      console.error('Error loading order stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  }
}

