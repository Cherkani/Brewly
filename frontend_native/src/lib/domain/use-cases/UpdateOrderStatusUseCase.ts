/**
 * Update Order Status Use Case
 * Business logic for updating order status
 */

import { Order, OrderStatus } from '../entities/Order';
import { IOrderRepository } from '../repositories/IOrderRepository';

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(orderId: string, newStatus: OrderStatus): Promise<Order> {
    // Get current order
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition
    const allowedStatuses = order.getNextPossibleStatuses();
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(
        `Cannot change order status from ${order.status} to ${newStatus}`
      );
    }

    // Update status
    return await this.orderRepository.updateStatus(orderId, { status: newStatus });
  }
}

