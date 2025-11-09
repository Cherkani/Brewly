/**
 * useSuppliers Hook
 * React hook for supplier operations
 */

'use client'

import { useState, useEffect } from 'react'
import { Supplier } from '@/lib/domain/entities/Supplier'
import { SupplierService } from '../services/SupplierService'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'

export function useSuppliers(activeOnly: boolean = true) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useAppStore()
  const supplierService = new SupplierService()

  useEffect(() => {
    if (!currentOrganization) {
      setSuppliers([])
      setLoading(false)
      return
    }

    loadSuppliers()
  }, [currentOrganization?.id, activeOnly])

  const loadSuppliers = async () => {
    if (!currentOrganization) return

    try {
      setLoading(true)
      setError(null)
      const data = await supplierService.getSuppliers(currentOrganization.id, activeOnly)
      setSuppliers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers')
      console.error('Error loading suppliers:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadSuppliers()
  }

  return {
    suppliers,
    loading,
    error,
    refresh,
  }
}

export function useSupplier(id: string | null) {
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supplierService = new SupplierService()

  useEffect(() => {
    if (!id) {
      setSupplier(null)
      setLoading(false)
      return
    }

    loadSupplier()
  }, [id])

  const loadSupplier = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await supplierService.getSupplier(id)
      setSupplier(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supplier')
      console.error('Error loading supplier:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    supplier,
    loading,
    error,
    refresh: loadSupplier,
  }
}

export function useSupplierCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useAppStore()
  const supplierService = new SupplierService()

  useEffect(() => {
    if (!currentOrganization) {
      setCategories([])
      setLoading(false)
      return
    }

    loadCategories()
  }, [currentOrganization?.id])

  const loadCategories = async () => {
    if (!currentOrganization) return

    try {
      setLoading(true)
      setError(null)
      const data = await supplierService.getCategories(currentOrganization.id)
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
  }
}

export function useTopRatedSuppliers(limit: number = 5) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useAppStore()
  const supplierService = new SupplierService()

  useEffect(() => {
    if (!currentOrganization) {
      setSuppliers([])
      setLoading(false)
      return
    }

    loadSuppliers()
  }, [currentOrganization?.id, limit])

  const loadSuppliers = async () => {
    if (!currentOrganization) return

    try {
      setLoading(true)
      setError(null)
      const data = await supplierService.getTopRatedSuppliers(currentOrganization.id, limit)
      setSuppliers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers')
      console.error('Error loading top suppliers:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    suppliers,
    loading,
    error,
    refresh: loadSuppliers,
  }
}

