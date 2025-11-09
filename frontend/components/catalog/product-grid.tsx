/**
 * Product Grid Component
 * Displays products in a responsive grid
 */

'use client'

import { Product } from '@/lib/domain/entities/Product'
import { ProductCard } from './product-card'

interface ProductGridProps {
  products: Product[]
  onSelectProduct?: (product: Product) => void
  onEditProduct?: (product: Product) => void
  emptyMessage?: string
}

export function ProductGrid({
  products,
  onSelectProduct,
  onEditProduct,
  emptyMessage = 'No products found'
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">☕</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onSelectProduct}
          onEdit={onEditProduct}
        />
      ))}
    </div>
  )
}

