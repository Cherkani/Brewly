/**
 * Order Repository Interface
 * Defines the contract for order data access
 */

import { Order, OrderStatus } from '../entities/Order'

export interface CreateOrderDTO {
  orgId: string
  locationId: string
  cashierId: string
  items: Array<{
    productId: string
    sizeId: string
    quantity: number
    basePriceInCents: number
    modifierIds: string[]
  }>
  discountInCents?: number
  notes?: string | null
}

export interface UpdateOrderDTO {
  status?: OrderStatus
  discountInCents?: number
  notes?: string | null
}

export interface AddPaymentDTO {
  orderId: string
  method: 'cash' | 'credit_card' | 'debit_card' | 'mobile_payment'
  amountInCents: number
}

export interface IOrderRepository {
  /**
   * Find order by ID
   */
  findById(id: string): Promise<Order | null>

  /**
   * Find orders for a location
   */
  findByLocation(
    locationId: string,
    filters?: {
      status?: OrderStatus
      startDate?: Date
      endDate?: Date
    }
  ): Promise<Order[]>

  /**
   * Find orders by status
   */
  findByStatus(locationId: string, status: OrderStatus): Promise<Order[]>

  /**
   * Get recent orders
   */
  getRecent(locationId: string, limit?: number): Promise<Order[]>

  /**
   * Create a new order
   */
  create(data: CreateOrderDTO): Promise<Order>

  /**
   * Update an existing order
   */
  update(id: string, data: UpdateOrderDTO): Promise<Order>

  /**
   * Update order status
   */
  updateStatus(id: string, status: OrderStatus): Promise<Order>

  /**
   * Delete an order
   */
  delete(id: string): Promise<void>

  /**
   * Add payment to order
   */
  addPayment(data: AddPaymentDTO): Promise<void>

  /**
   * Get order count by status
   */
  getCountByStatus(locationId: string): Promise<Record<OrderStatus, number>>

  /**
   * Subscribe to order updates (realtime)
   */
  subscribeToOrders(
    locationId: string,
    callback: (order: Order) => void
  ): () => void
}

