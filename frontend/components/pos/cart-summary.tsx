/**
 * Cart Summary Component
 * Displays cart totals and checkout button
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCents } from '@/lib/shared/utils/currency'
import { usePOSStore } from '@/lib/infrastructure/state/stores/posStore'

interface CartSummaryProps {
  onCheckout?: () => void
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const { cart, discountInCents, getSubtotal, getTotal, getItemCount } = usePOSStore()

  const subtotal = getSubtotal()
  const total = getTotal()
  const itemCount = getItemCount()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span>{itemCount}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCents(subtotal)}</span>
        </div>

        {discountInCents > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatCents(discountInCents)}</span>
          </div>
        )}

        <div className="border-t pt-3 flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatCents(total)}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={cart.length === 0}
        >
          Checkout
        </Button>
      </CardFooter>
    </Card>
  )
}

