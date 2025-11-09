/**
 * Ingredient Entity
 * Represents an inventory item used in recipes
 */

export class Ingredient {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly locationId: string,
    public readonly name: string,
    public readonly unit: string,
    public readonly onHand: number,
    public readonly lowStockThreshold: number,
    public readonly unitCostInCents: number,
    public readonly createdAt: Date
  ) {
    if (onHand < 0) {
      throw new Error('On hand quantity cannot be negative')
    }
    if (lowStockThreshold < 0) {
      throw new Error('Low stock threshold cannot be negative')
    }
    if (unitCostInCents < 0) {
      throw new Error('Unit cost cannot be negative')
    }
  }

  /**
   * Check if ingredient is out of stock
   */
  isOutOfStock(): boolean {
    return this.onHand <= 0
  }

  /**
   * Check if ingredient is low on stock
   */
  isLowStock(): boolean {
    return this.onHand > 0 && this.onHand <= this.lowStockThreshold
  }

  /**
   * Check if ingredient is in stock
   */
  isInStock(): boolean {
    return this.onHand > this.lowStockThreshold
  }

  /**
   * Get stock status
   */
  getStockStatus(): 'out_of_stock' | 'low_stock' | 'in_stock' {
    if (this.isOutOfStock()) return 'out_of_stock'
    if (this.isLowStock()) return 'low_stock'
    return 'in_stock'
  }

  /**
   * Get stock status display text
   */
  getStockStatusDisplay(): string {
    switch (this.getStockStatus()) {
      case 'out_of_stock':
        return 'Out of Stock'
      case 'low_stock':
        return 'Low Stock'
      case 'in_stock':
        return 'In Stock'
    }
  }

  /**
   * Get stock status color for UI
   */
  getStockStatusColor(): string {
    switch (this.getStockStatus()) {
      case 'out_of_stock':
        return 'red'
      case 'low_stock':
        return 'yellow'
      case 'in_stock':
        return 'green'
    }
  }

  /**
   * Calculate total value of on-hand stock
   */
  calculateStockValue(): number {
    return this.onHand * this.unitCostInCents
  }

  /**
   * Get stock value in dollars
   */
  getStockValueInDollars(): number {
    return this.calculateStockValue() / 100
  }

  /**
   * Format stock value as currency
   */
  formatStockValue(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.getStockValueInDollars())
  }

  /**
   * Get percentage of stock remaining
   */
  getStockPercentage(): number {
    if (this.lowStockThreshold === 0) return 100
    return Math.min(100, (this.onHand / this.lowStockThreshold) * 100)
  }

  /**
   * Get display text for on-hand quantity
   */
  getOnHandDisplay(): string {
    return `${this.onHand.toFixed(2)} ${this.unit}`
  }
}

