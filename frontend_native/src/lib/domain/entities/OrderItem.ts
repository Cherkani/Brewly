/**
 * Order Item Entity
 * Represents a single item in an order
 */

export interface OrderItemModifier {
  id: string;
  name: string;
  priceDeltaInCents: number;
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
    public readonly modifiers: OrderItemModifier[],
    public readonly createdAt: Date
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (basePriceInCents < 0) {
      throw new Error('Base price cannot be negative');
    }
    if (lineTotalInCents < 0) {
      throw new Error('Line total cannot be negative');
    }
  }

  /**
   * Get price per unit
   */
  getPricePerUnit(): number {
    return this.lineTotalInCents / this.quantity;
  }

  /**
   * Get line total in dollars
   */
  getLineTotalInDollars(): number {
    return this.lineTotalInCents / 100;
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
   * Get display name with size
   */
  getDisplayName(): string {
    return `${this.productName} (${this.sizeName})`;
  }

  /**
   * Get modifiers summary
   */
  getModifiersSummary(): string {
    if (this.modifiers.length === 0) return '';
    return this.modifiers.map(m => m.name).join(', ');
  }

  /**
   * Check if item has modifiers
   */
  hasModifiers(): boolean {
    return this.modifiers.length > 0;
  }
}

