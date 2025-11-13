/**
 * Product Entity
 * Pure business object representing a product in the catalog
 */

export class Product {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly storeId: string,
    public readonly name: string,
    public readonly category: string | null,
    public readonly priceCents: number,
    public readonly isActive: boolean,
    public readonly imageUrl: string | null,
    public readonly createdAt: Date
  ) {
    if (priceCents < 0) {
      throw new Error('Price cannot be negative');
    }
  }

  /**
   * Check if product can be ordered
   */
  canBeOrdered(): boolean {
    return this.isActive && this.priceCents > 0;
  }

  /**
   * Get price in dollars
   */
  getPriceInDollars(): number {
    return this.priceCents / 100;
  }

  /**
   * Format price as currency
   */
  formatPrice(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.getPriceInDollars());
  }

  /**
   * Get display name
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * Check if product has image
   */
  hasImage(): boolean {
    return !!this.imageUrl;
  }
}
