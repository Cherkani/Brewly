/**
 * Modifier Entity
 * Represents an individual modifier option (e.g., Whole Milk, Almond Milk)
 */

export class Modifier {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly name: string,
    public readonly priceDeltaInCents: number
  ) {}

  /**
   * Check if modifier has additional cost
   */
  hasAdditionalCost(): boolean {
    return this.priceDeltaInCents !== 0
  }

  /**
   * Get price delta in dollars
   */
  getPriceDeltaInDollars(): number {
    return this.priceDeltaInCents / 100
  }

  /**
   * Format price delta for display
   */
  formatPriceDelta(locale: string = 'en-US', currency: string = 'USD'): string {
    if (this.priceDeltaInCents === 0) {
      return ''
    }

    const amount = Math.abs(this.getPriceDeltaInDollars())
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount)

    return this.priceDeltaInCents > 0 ? `+${formatted}` : `-${formatted}`
  }

  /**
   * Get display name with price
   */
  getDisplayName(locale?: string, currency?: string): string {
    const priceDelta = this.formatPriceDelta(locale, currency)
    return priceDelta ? `${this.name} ${priceDelta}` : this.name
  }
}

