/**
 * usePurchaseOrders Hook
 * React hook for purchase order operations
 */

'use client'

import { useState, useEffect } from 'react'
import { PurchaseOrder, POStatus } from '@/lib/domain/entities/PurchaseOrder'
import { PurchaseOrderService } from '../services/PurchaseOrderService'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'

export function usePurchaseOrders(filters?: {
  status?: POStatus
  supplierId?: string
  startDate?: Date
  endDate?: Date
}) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const poService = new PurchaseOrderService()

  useEffect(() => {
    if (!currentLocation) {
      setPurchaseOrders([])
      setLoading(false)
      return
    }

    loadPurchaseOrders()
  }, [currentLocation?.id, filters?.status, filters?.supplierId])

  const loadPurchaseOrders = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await poService.getPurchaseOrders(currentLocation.id, filters)
      setPurchaseOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase orders')
      console.error('Error loading purchase orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadPurchaseOrders()
  }

  return {
    purchaseOrders,
    loading,
    error,
    refresh,
  }
}

export function usePurchaseOrder(id: string | null) {
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const poService = new PurchaseOrderService()

  useEffect(() => {
    if (!id) {
      setPurchaseOrder(null)
      setLoading(false)
      return
    }

    loadPurchaseOrder()
  }, [id])

  const loadPurchaseOrder = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await poService.getPurchaseOrder(id)
      setPurchaseOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase order')
      console.error('Error loading purchase order:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    purchaseOrder,
    loading,
    error,
    refresh: loadPurchaseOrder,
  }
}

export function usePurchaseOrdersByStatus(status: POStatus) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const poService = new PurchaseOrderService()

  useEffect(() => {
    if (!currentLocation) {
      setPurchaseOrders([])
      setLoading(false)
      return
    }

    loadPurchaseOrders()
  }, [currentLocation?.id, status])

  const loadPurchaseOrders = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await poService.getPurchaseOrdersByStatus(currentLocation.id, status)
      setPurchaseOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase orders')
      console.error('Error loading purchase orders:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    purchaseOrders,
    loading,
    error,
    refresh: loadPurchaseOrders,
  }
}

export function useRecentPurchaseOrders(limit: number = 10) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const poService = new PurchaseOrderService()

  useEffect(() => {
    if (!currentLocation) {
      setPurchaseOrders([])
      setLoading(false)
      return
    }

    loadPurchaseOrders()
  }, [currentLocation?.id, limit])

  const loadPurchaseOrders = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await poService.getRecentPurchaseOrders(currentLocation.id, limit)
      setPurchaseOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase orders')
      console.error('Error loading purchase orders:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    purchaseOrders,
    loading,
    error,
    refresh: loadPurchaseOrders,
  }
}

export function usePurchaseOrderStats() {
  const [stats, setStats] = useState<Record<POStatus, number>>({
    draft: 0,
    sent: 0,
    confirmed: 0,
    received: 0,
    cancelled: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const poService = new PurchaseOrderService()

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
      const data = await poService.getPurchaseOrderCountByStatus(currentLocation.id)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
      console.error('Error loading purchase order stats:', err)
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

