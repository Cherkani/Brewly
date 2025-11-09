/**
 * useProducts Hook
 * React hook for product operations
 */

'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/domain/entities/Product'
import { ProductService } from '../services/ProductService'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'

export function useProducts(activeOnly: boolean = true) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const productService = new ProductService()

  useEffect(() => {
    if (!currentLocation) {
      setProducts([])
      setLoading(false)
      return
    }

    loadProducts()
  }, [currentLocation?.id, activeOnly])

  const loadProducts = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProducts(currentLocation.id, activeOnly)
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadProducts()
  }

  return {
    products,
    loading,
    error,
    refresh
  }
}

export function useProductsByCategory(category: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const productService = new ProductService()

  useEffect(() => {
    if (!currentLocation || !category) {
      setProducts([])
      setLoading(false)
      return
    }

    loadProducts()
  }, [currentLocation?.id, category])

  const loadProducts = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProductsByCategory(
        currentLocation.id,
        category
      )
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    products,
    loading,
    error,
    refresh: loadProducts
  }
}

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const productService = new ProductService()

  useEffect(() => {
    if (!id) {
      setProduct(null)
      setLoading(false)
      return
    }

    loadProduct()
  }, [id])

  const loadProduct = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProduct(id)
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
      console.error('Error loading product:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    product,
    loading,
    error,
    refresh: loadProduct
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const productService = new ProductService()

  useEffect(() => {
    if (!currentLocation) {
      setCategories([])
      setLoading(false)
      return
    }

    loadCategories()
  }, [currentLocation?.id])

  const loadCategories = async () => {
    if (!currentLocation) return

    try {
      setLoading(true)
      setError(null)
      const data = await productService.getCategories(currentLocation.id)
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
    refresh: loadCategories
  }
}

