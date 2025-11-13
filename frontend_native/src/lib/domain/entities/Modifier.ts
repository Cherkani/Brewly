/**
 * Modifier Entity
 * Represents a single modifier option (e.g., "Almond Milk", "Extra Shot")
 */

export class Modifier {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly name: string,
    public readonly priceDeltaInCents: number,
    public readonly createdAt: Date
  ) {}

  /**
   * Check if modifier has additional cost
   */
  hasAdditionalCost(): boolean {
    return this.priceDeltaInCents > 0;
  }

  /**
   * Get price delta in dollars
   */
  getPriceDeltaInDollars(): number {
    return this.priceDeltaInCents / 100;
  }

  /**
   * Format price delta as currency
   */
  formatPriceDelta(locale: string = 'en-US', currency: string = 'USD'): string {
    const amount = this.getPriceDeltaInDollars();
    if (amount === 0) return '';
    
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(Math.abs(amount));
    
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }
}

