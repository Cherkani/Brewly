/**
 * Order Item Entity
 * Represents a single item in an order
 */

export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly priceCents: number,
    public readonly lineTotalCents: number,
    public readonly createdAt: Date
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (priceCents < 0) {
      throw new Error('Price cannot be negative');
    }
    if (lineTotalCents < 0) {
      throw new Error('Line total cannot be negative');
    }
  }

  /**
   * Get price per unit
   */
  getPricePerUnit(): number {
    return this.priceCents / 100;
  }

  /**
   * Get line total in dollars
   */
  getLineTotalInDollars(): number {
    return this.lineTotalCents / 100;
  }

  /**
   * Format line total as currency
   */
  formatLineTotal(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.getLineTotalInDollars());
  }

  /**
   * Format price per unit as currency
   */
  formatPricePerUnit(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.getPricePerUnit());
  }
}
