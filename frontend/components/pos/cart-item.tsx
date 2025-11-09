/**
 * Cart Item Component
 * Displays a single item in the POS cart
 */

'use client'

import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/shared/utils/currency'

interface CartItemProps {
  item: {
    productName: string
    sizeName: string
    quantity: number
    basePriceInCents: number
    modifiers: Array<{
      name: string
      priceDeltaInCents: number
    }>
  }
  onRemove?: () => void
  onUpdateQuantity?: (quantity: number) => void
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const modifiersTotal = item.modifiers.reduce(
    (sum, mod) => sum + mod.priceDeltaInCents,
    0
  )
  const itemTotal = (item.basePriceInCents + modifiersTotal) * item.quantity

  return (
    <div className="flex items-start gap-3 py-3 border-b">
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{item.productName}</h4>
            <p className="text-sm text-muted-foreground">{item.sizeName}</p>
          </div>
          <span className="font-semibold">{formatCents(itemTotal)}</span>
        </div>

        {item.modifiers.length > 0 && (
          <div className="mt-1 text-sm text-muted-foreground">
            {item.modifiers.map((mod, idx) => (
              <div key={idx}>
                + {mod.name}
                {mod.priceDeltaInCents !== 0 && (
                  <span className="ml-1">
                    ({formatCents(mod.priceDeltaInCents)})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          {onUpdateQuantity && (
            <div className="flex items-center gap-1 border rounded">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="px-2 text-sm font-medium">{item.quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          )}

          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

