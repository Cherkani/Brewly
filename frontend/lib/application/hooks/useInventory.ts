/**
 * useInventory Hook
 * React hook for inventory operations
 */

'use client'

import { useState, useEffect } from 'react'
import { Ingredient } from '@/lib/domain/entities/Ingredient'
import { InventoryService } from '../services/InventoryService'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const inventoryService = new InventoryService()

  useEffect(() => {
    if (!currentLocation) {
      setIngredients([])
      setLoading(false)
      return
    }

    loadIngredients()
  }, [currentLocation?.id])

  const loadIngredients = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await inventoryService.getIngredients(currentLocation.id)
      setIngredients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredients')
      console.error('Error loading ingredients:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadIngredients()
  }

  return {
    ingredients,
    loading,
    error,
    refresh,
  }
}

export function useIngredient(id: string | null) {
  const [ingredient, setIngredient] = useState<Ingredient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const inventoryService = new InventoryService()

  useEffect(() => {
    if (!id) {
      setIngredient(null)
      setLoading(false)
      return
    }

    loadIngredient()
  }, [id])

  const loadIngredient = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await inventoryService.getIngredient(id)
      setIngredient(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredient')
      console.error('Error loading ingredient:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    ingredient,
    loading,
    error,
    refresh: loadIngredient,
  }
}

export function useInventoryAlerts() {
  const [alerts, setAlerts] = useState<{
    lowStock: Ingredient[]
    outOfStock: Ingredient[]
    totalAlerts: number
  }>({
    lowStock: [],
    outOfStock: [],
    totalAlerts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const inventoryService = new InventoryService()

  useEffect(() => {
    if (!currentLocation) {
      setLoading(false)
      return
    }

    loadAlerts()
  }, [currentLocation?.id])

  const loadAlerts = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await inventoryService.getInventoryAlerts(currentLocation.id)
      setAlerts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
      console.error('Error loading alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    alerts,
    loading,
    error,
    refresh: loadAlerts,
  }
}

export function useInventoryValue() {
  const [totalValue, setTotalValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const inventoryService = new InventoryService()

  useEffect(() => {
    if (!currentLocation) {
      setTotalValue(0)
      setLoading(false)
      return
    }

    loadValue()
  }, [currentLocation?.id])

  const loadValue = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const value = await inventoryService.getTotalInventoryValue(currentLocation.id)
      setTotalValue(value)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate value')
      console.error('Error calculating value:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    totalValue,
    loading,
    error,
    refresh: loadValue,
  }
}

