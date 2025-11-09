/**
 * Update Order Status Use Case
 * Business logic for updating order status
 */

import { IOrderRepository } from '../repositories/IOrderRepository'
import { Order, OrderStatus } from '../entities/Order'

export interface UpdateOrderStatusInput {
  orderId: string
  newStatus: OrderStatus
}

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: UpdateOrderStatusInput): Promise<Order> {
    // 1. Fetch the order
    const order = await this.orderRepository.findById(input.orderId)
    if (!order) {
      throw new Error(`Order not found: ${input.orderId}`)
    }

    // 2. Validate status transition
    this.validateStatusTransition(order, input.newStatus)

    // 3. Update status
    const updatedOrder = await this.orderRepository.updateStatus(
      input.orderId,
      input.newStatus
    )

    return updatedOrder
  }

  private validateStatusTransition(order: Order, newStatus: OrderStatus): void {
    const allowedStatuses = order.getNextPossibleStatuses()

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${order.status} to ${newStatus}. ` +
        `Allowed transitions: ${allowedStatuses.join(', ')}`
      )
    }
  }
}

