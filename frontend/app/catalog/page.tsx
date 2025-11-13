/**
 * Catalog Page
 * Product catalog management interface
 */

'use client'

import { useState } from 'react'
import { useProducts, useCategories } from '@/lib/application/hooks/useProducts'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'
import { ProductGrid } from '@/components/catalog/product-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Product } from '@/lib/domain/entities/Product'
import { Input } from '@/components/ui/input'

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { currentLocation } = useAppStore()
  const { products, loading: productsLoading } = useProducts(false) // Show all products, not just active
  const { categories, loading: categoriesLoading } = useCategories()

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleEditProduct = (product: Product) => {
    // TODO: Implement product edit modal/page
    alert(`Edit product: ${product.name}\n\nThis feature will be implemented soon.`)
  }

  const handleCreateProduct = () => {
    // TODO: Implement product creation modal/page
    alert('Create new product\n\nThis feature will be implemented soon.')
  }

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Location Selected</h2>
          <p className="text-muted-foreground">
            Please select a location to view the catalog
          </p>
        </div>
      </div>
    )
  }

  const activeProducts = products.filter(p => p.isActive).length
  const inactiveProducts = products.filter(p => !p.isActive).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog for {currentLocation.name}
          </p>
        </div>
        <Button onClick={handleCreateProduct}>
          + Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-4xl">{products.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              All products in catalog
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Products</CardDescription>
            <CardTitle className="text-4xl text-green-600">{activeProducts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Available for ordering
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Inactive Products</CardDescription>
            <CardTitle className="text-4xl text-gray-500">{inactiveProducts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Hidden from customers
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <Input
              type="text"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              All Categories
            </Button>
            {categoriesLoading ? (
              <div className="text-sm text-muted-foreground">Loading categories...</div>
            ) : (
              categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
            {selectedCategory && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          <ProductGrid
            products={filteredProducts}
            onEditProduct={handleEditProduct}
            emptyMessage={
              searchQuery || selectedCategory
                ? 'No products match your filters'
                : 'No products found. Create your first product to get started!'
            }
          />
        </div>
      )}
    </div>
  )
}

