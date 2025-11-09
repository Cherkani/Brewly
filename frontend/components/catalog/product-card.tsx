/**
 * Product Card Component
 * Displays a product with image, name, category, and price
 */

'use client'

import { Product } from '@/lib/domain/entities/Product'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/shared/utils/currency'

interface ProductCardProps {
  product: Product
  onSelect?: (product: Product) => void
  onEdit?: (product: Product) => void
}

export function ProductCard({ product, onSelect, onEdit }: ProductCardProps) {
  const sizes = product.getAvailableSizes()
  const minPrice = sizes.length > 0 ? Math.min(...sizes.map(s => s.price)) : 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-4xl">☕</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          {!product.isActive && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
              Inactive
            </span>
          )}
        </div>
        
        <div className="mt-2">
          {sizes.length > 0 ? (
            <p className="text-sm">
              From <span className="font-semibold">{formatCents(Math.round(minPrice * 100))}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No prices set</p>
          )}
        </div>

        {product.hasModifiers() && (
          <p className="text-xs text-muted-foreground mt-2">
            {product.modifierGroups.length} modifier group(s)
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {onSelect && (
          <Button
            onClick={() => onSelect(product)}
            className="flex-1"
            disabled={!product.canBeOrdered()}
          >
            Add to Order
          </Button>
        )}
        {onEdit && (
          <Button
            onClick={() => onEdit(product)}
            variant="outline"
            className="flex-1"
          >
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

