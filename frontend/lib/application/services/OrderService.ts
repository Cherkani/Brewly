/**
 * Order Service
 * Application-level service for order operations
 */

import { Order, OrderStatus } from '@/lib/domain/entities/Order'
import { OrderRepository } from '@/lib/infrastructure/supabase/repositories/OrderRepository'
import { CreateOrderDTO, AddPaymentDTO } from '@/lib/domain/repositories/IOrderRepository'
import { CreateOrderUseCase } from '@/lib/domain/use-cases/CreateOrderUseCase'
import { UpdateOrderStatusUseCase } from '@/lib/domain/use-cases/UpdateOrderStatusUseCase'
import { ProductRepository } from '@/lib/infrastructure/supabase/repositories/ProductRepository'

export class OrderService {
  private orderRepository: OrderRepository
  private productRepository: ProductRepository
  private createOrderUseCase: CreateOrderUseCase
  private updateOrderStatusUseCase: UpdateOrderStatusUseCase

  constructor() {
    this.orderRepository = new OrderRepository()
    this.productRepository = new ProductRepository()
    this.createOrderUseCase = new CreateOrderUseCase(
      this.orderRepository,
      this.productRepository
    )
    this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
      this.orderRepository
    )
  }

  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<Order | null> {
    return await this.orderRepository.findById(id)
  }

  /**
   * Get orders for a location
   */
  async getOrders(
    locationId: string,
    filters?: {
      status?: OrderStatus
      startDate?: Date
      endDate?: Date
    }
  ): Promise<Order[]> {
    return await this.orderRepository.findByLocation(locationId, filters)
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    locationId: string,
    status: OrderStatus
  ): Promise<Order[]> {
    return await this.orderRepository.findByStatus(locationId, status)
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(locationId: string, limit?: number): Promise<Order[]> {
    return await this.orderRepository.getRecent(locationId, limit)
  }

  /**
   * Create a new order (uses use case for validation)
   */
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    return await this.createOrderUseCase.execute({
      orgId: data.orgId,
      locationId: data.locationId,
      cashierId: data.cashierId,
      items: data.items,
      discountInCents: data.discountInCents,
      notes: data.notes,
    })
  }

  /**
   * Update order status (uses use case for validation)
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    return await this.updateOrderStatusUseCase.execute({
      orderId,
      newStatus,
    })
  }

  /**
   * Add payment to order
   */
  async addPayment(data: AddPaymentDTO): Promise<void> {
    await this.orderRepository.addPayment(data)
  }

  /**
   * Get order count by status
   */
  async getOrderCountByStatus(
    locationId: string
  ): Promise<Record<OrderStatus, number>> {
    return await this.orderRepository.getCountByStatus(locationId)
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrders(
    locationId: string,
    callback: (order: Order) => void
  ): () => void {
    return this.orderRepository.subscribeToOrders(locationId, callback)
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    return await this.updateOrderStatus(orderId, 'cancelled')
  }

  /**
   * Complete an order
   */
  async completeOrder(orderId: string): Promise<Order> {
    return await this.updateOrderStatus(orderId, 'completed')
  }
}

