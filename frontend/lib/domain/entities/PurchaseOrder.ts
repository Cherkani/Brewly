/**
 * Purchase Order Entity
 * Represents a purchase order to a supplier
 */

export type POStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'

export interface POItem {
  id: string
  supplierProductId: string | null
  itemName: string
  quantity: number
  unitPriceCents: number
  totalPriceCents: number
  unit: string
}

export class PurchaseOrder {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly locationId: string,
    public readonly supplierId: string,
    public readonly supplierName: string,
    public readonly orderNumber: string,
    public readonly status: POStatus,
    public readonly totalAmountCents: number,
    public readonly orderDate: Date,
    public readonly expectedDelivery: Date | null,
    public readonly notes: string | null,
    public readonly items: POItem[],
    public readonly createdAt: Date
  ) {}

  /**
   * Calculate total from items
   */
  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.totalPriceCents, 0)
  }

  /**
   * Get total in dollars
   */
  getTotalInDollars(): number {
    return this.totalAmountCents / 100
  }

  /**
   * Format total as currency
   */
  formatTotal(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(this.getTotalInDollars())
  }

  /**
   * Check if PO can be edited
   */
  canBeEdited(): boolean {
    return this.status === 'draft'
  }

  /**
   * Check if PO can be cancelled
   */
  canBeCancelled(): boolean {
    return this.status !== 'received' && this.status !== 'cancelled'
  }

  /**
   * Check if PO is overdue
   */
  isOverdue(): boolean {
    if (!this.expectedDelivery || this.status === 'received' || this.status === 'cancelled') {
      return false
    }
    return new Date() > this.expectedDelivery
  }

  /**
   * Get status display text
   */
  getStatusDisplay(): string {
    switch (this.status) {
      case 'draft':
        return 'Draft'
      case 'sent':
        return 'Sent'
      case 'confirmed':
        return 'Confirmed'
      case 'received':
        return 'Received'
      case 'cancelled':
        return 'Cancelled'
      default:
        return this.status
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(): string {
    switch (this.status) {
      case 'draft':
        return 'gray'
      case 'sent':
        return 'blue'
      case 'confirmed':
        return 'purple'
      case 'received':
        return 'green'
      case 'cancelled':
        return 'red'
      default:
        return 'gray'
    }
  }

  /**
   * Get next possible statuses
   */
  getNextPossibleStatuses(): POStatus[] {
    switch (this.status) {
      case 'draft':
        return ['sent', 'cancelled']
      case 'sent':
        return ['confirmed', 'cancelled']
      case 'confirmed':
        return ['received', 'cancelled']
      case 'received':
      case 'cancelled':
        return []
      default:
        return []
    }
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  /**
   * Get days until delivery
   */
  getDaysUntilDelivery(): number | null {
    if (!this.expectedDelivery) return null
    const diff = this.expectedDelivery.getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
}

