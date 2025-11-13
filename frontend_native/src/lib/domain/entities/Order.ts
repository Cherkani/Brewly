/**
 * Order Entity
 * Represents a customer order
 */

import { OrderItem } from './OrderItem';

export type OrderStatus = 
  | 'queued' 
  | 'in_progress' 
  | 'ready' 
  | 'paid' 
  | 'completed' 
  | 'cancelled';

export class Order {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly storeId: string,
    public readonly number: number,
    public readonly status: OrderStatus,
    public readonly cashierId: string | null,
    public readonly totalCents: number,
    public readonly items: OrderItem[],
    public readonly notes: string | null,
    public readonly createdAt: Date
  ) {
    if (totalCents < 0) {
      throw new Error('Total cannot be negative');
    }
  }

  /**
   * Calculate total from items (for validation)
   */
  calculateTotalFromItems(): number {
    return this.items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  }

  /**
   * Get total in dollars
   */
  getTotalInDollars(): number {
    return this.totalCents / 100;
  }

  /**
   * Format total as currency
   */
  formatTotal(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.getTotalInDollars());
  }

  /**
   * Check if order can be edited
   */
  canBeEdited(): boolean {
    return this.status === 'queued';
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled(): boolean {
    return this.status !== 'completed' && this.status !== 'cancelled';
  }

  /**
   * Check if order is in progress
   */
  isInProgress(): boolean {
    return this.status === 'in_progress';
  }

  /**
   * Check if order is ready
   */
  isReady(): boolean {
    return this.status === 'ready';
  }

  /**
   * Check if order is paid
   */
  isPaid(): boolean {
    return this.status === 'paid' || this.status === 'completed';
  }

  /**
   * Check if order is completed
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Get next possible statuses
   */
  getNextPossibleStatuses(): OrderStatus[] {
    switch (this.status) {
      case 'queued':
        return ['in_progress', 'cancelled'];
      case 'in_progress':
        return ['ready', 'cancelled'];
      case 'ready':
        return ['paid'];
      case 'paid':
        return ['completed'];
      case 'completed':
      case 'cancelled':
        return [];
      default:
        return [];
    }
  }

  /**
   * Get status display text
   */
  getStatusDisplay(): string {
    switch (this.status) {
      case 'queued':
        return 'Queued';
      case 'in_progress':
        return 'In Progress';
      case 'ready':
        return 'Ready';
      case 'paid':
        return 'Paid';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return this.status;
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(): string {
    switch (this.status) {
      case 'queued':
        return '#6B7280';
      case 'in_progress':
        return '#3B82F6';
      case 'ready':
        return '#10B981';
      case 'paid':
        return '#8B5CF6';
      case 'completed':
        return '#14B8A6';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }

  /**
   * Get order summary for display
   */
  getSummary(): string {
    const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    return `Order #${this.number} - ${itemCount} item${itemCount !== 1 ? 's' : ''} - ${this.formatTotal()}`;
  }

  /**
   * Get total item count
   */
  getTotalItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
