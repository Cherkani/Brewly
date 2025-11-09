/**
 * POS Page
 * Point of Sale interface for taking orders
 */

'use client'

import { useState } from 'react'
import { useProducts, useCategories } from '@/lib/application/hooks/useProducts'
import { usePOSStore } from '@/lib/infrastructure/state/stores/posStore'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'
import { ProductGrid } from '@/components/catalog/product-grid'
import { CartItem } from '@/components/pos/cart-item'
import { CartSummary } from '@/components/pos/cart-summary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Product } from '@/lib/domain/entities/Product'

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { currentLocation } = useAppStore()
  const { cart, addToCart, updateCartItem, removeFromCart, clearCart } = usePOSStore()
  const { products, loading: productsLoading } = useProducts(true)
  const { categories, loading: categoriesLoading } = useCategories()

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products

  const handleSelectProduct = (product: Product) => {
    // For simplicity, add with first size and no modifiers
    // In a real app, you'd open a modal to select size and modifiers
    const sizes = product.getAvailableSizes()
    if (sizes.length === 0) {
      alert('This product has no sizes configured')
      return
    }

    const firstSize = sizes[0]
    addToCart({
      productId: product.id,
      productName: product.name,
      sizeId: firstSize.id,
      sizeName: firstSize.name,
      quantity: 1,
      basePriceInCents: Math.round(firstSize.price * 100),
      modifiers: []
    })
  }

  const handleCheckout = () => {
    // In a real app, this would open a payment modal
    alert('Checkout functionality to be implemented')
  }

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Location Selected</h2>
          <p className="text-muted-foreground">
            Please select a location to use the POS
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Products Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-background">
          <h1 className="text-3xl font-bold mb-4">Point of Sale</h1>
          
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              disabled={categoriesLoading}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {productsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onSelectProduct={handleSelectProduct}
              emptyMessage="No products available"
            />
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l bg-muted/20 flex flex-col">
        <Card className="m-4 flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Order</CardTitle>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-muted-foreground">Cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add products to start an order
                </p>
              </div>
            ) : (
              <div>
                {cart.map((item, index) => (
                  <CartItem
                    key={index}
                    item={item}
                    onRemove={() => removeFromCart(index)}
                    onUpdateQuantity={(quantity) =>
                      updateCartItem(index, { quantity })
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="p-4">
          <CartSummary onCheckout={handleCheckout} />
        </div>
      </div>
    </div>
  )
}

