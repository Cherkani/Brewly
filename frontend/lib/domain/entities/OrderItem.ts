/**
 * OrderItem Entity
 * Represents a line item in an order
 */

export interface OrderItemModifier {
  id: string
  name: string
  priceDeltaInCents: number
}

export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly sizeId: string,
    public readonly sizeName: string,
    public readonly quantity: number,
    public readonly basePriceInCents: number,
    public readonly lineTotalInCents: number,
    public readonly modifiers: OrderItemModifier[]
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }
    if (basePriceInCents < 0) {
      throw new Error('Base price cannot be negative')
    }
    if (lineTotalInCents < 0) {
      throw new Error('Line total cannot be negative')
    }
  }

  /**
   * Calculate unit price (base + modifiers)
   */
  calculateUnitPrice(): number {
    const modifiersTotal = this.modifiers.reduce(
      (sum, mod) => sum + mod.priceDeltaInCents,
      0
    )
    return this.basePriceInCents + modifiersTotal
  }

  /**
   * Get unit price in dollars
   */
  getUnitPriceInDollars(): number {
    return this.calculateUnitPrice() / 100
  }

  /**
   * Get line total in dollars
   */
  getLineTotalInDollars(): number {
    return this.lineTotalInCents / 100
  }

  /**
   * Format line total as currency
   */
  formatLineTotal(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.getLineTotalInDollars())
  }

  /**
   * Get display name with modifiers
   */
  getDisplayName(): string {
    let name = `${this.productName} (${this.sizeName})`
    if (this.modifiers.length > 0) {
      const modifierNames = this.modifiers.map(m => m.name).join(', ')
      name += ` - ${modifierNames}`
    }
    return name
  }

  /**
   * Get full description
   */
  getDescription(): string {
    const parts = [
      `${this.quantity}x ${this.productName}`,
      `Size: ${this.sizeName}`
    ]

    if (this.modifiers.length > 0) {
      parts.push(`Modifiers: ${this.modifiers.map(m => m.name).join(', ')}`)
    }

    return parts.join(' | ')
  }
}

