/**
 * Order Repository Interface
 * Defines the contract for order data access
 */

import { Order, OrderStatus } from '../entities/Order';

export interface CreateOrderDTO {
  orgId: string;
  storeId: string;
  cashierId: string | null;
  items: Array<{
    productId: string;
    quantity: number;
    priceCents: number;
  }>;
  notes?: string | null;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}

export interface IOrderRepository {
  /**
   * Find order by ID
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Find all orders for a store
   */
  findByStore(
    storeId: string,
    status?: OrderStatus,
    limit?: number
  ): Promise<Order[]>;

  /**
   * Get order statistics
   */
  getStats(storeId: string, date?: Date): Promise<{
    queued: number;
    in_progress: number;
    ready: number;
    paid: number;
    completed: number;
    cancelled: number;
  }>;

  /**
   * Create a new order
   */
  create(data: CreateOrderDTO): Promise<Order>;

  /**
   * Update order status
   */
  updateStatus(id: string, data: UpdateOrderStatusDTO): Promise<Order>;

  /**
   * Cancel an order
   */
  cancel(id: string): Promise<Order>;

  /**
   * Subscribe to order updates for a store
   */
  subscribeToOrders(
    storeId: string,
    callback: (order: Order) => void
  ): () => void;
}
