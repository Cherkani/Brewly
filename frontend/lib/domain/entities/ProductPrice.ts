/**
 * ProductPrice Entity
 * Represents pricing for a product-size combination
 */

export class ProductPrice {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly sizeId: string,
    public readonly sizeName: string,
    public readonly priceInCents: number
  ) {
    if (priceInCents < 0) {
      throw new Error('Price cannot be negative')
    }
  }

  /**
   * Get price in dollars
   */
  getPriceInDollars(): number {
    return this.priceInCents / 100
  }

  /**
   * Format price as currency
   */
  formatPrice(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.getPriceInDollars())
  }
}

