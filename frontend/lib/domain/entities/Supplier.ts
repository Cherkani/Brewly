/**
 * Supplier Entity
 * Represents a supplier in the system
 */

export class Supplier {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly name: string,
    public readonly contactEmail: string | null,
    public readonly contactPhone: string | null,
    public readonly address: string | null,
    public readonly category: string | null,
    public readonly rating: number | null,
    public readonly isActive: boolean,
    public readonly paymentTerms: string | null,
    public readonly deliveryTime: string | null,
    public readonly createdAt: Date
  ) {
    if (rating !== null && (rating < 0 || rating > 5)) {
      throw new Error('Rating must be between 0 and 5')
    }
  }

  /**
   * Check if supplier has contact information
   */
  hasContactInfo(): boolean {
    return !!(this.contactEmail || this.contactPhone)
  }

  /**
   * Get display rating (0-5 stars)
   */
  getDisplayRating(): string {
    if (this.rating === null) return 'No rating'
    return '⭐'.repeat(Math.round(this.rating))
  }

  /**
   * Check if supplier is reliable (rating >= 4)
   */
  isReliable(): boolean {
    return this.rating !== null && this.rating >= 4
  }

  /**
   * Get payment terms display
   */
  getPaymentTermsDisplay(): string {
    return this.paymentTerms || 'Not specified'
  }

  /**
   * Get delivery time display
   */
  getDeliveryTimeDisplay(): string {
    return this.deliveryTime || 'Not specified'
  }

  /**
   * Get supplier summary
   */
  getSummary(): string {
    const parts = [this.name]
    if (this.category) parts.push(this.category)
    if (this.rating) parts.push(`${this.rating}⭐`)
    return parts.join(' · ')
  }
}

