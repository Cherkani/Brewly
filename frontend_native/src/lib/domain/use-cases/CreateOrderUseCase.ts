/**
 * Create Order Use Case
 * Business logic for creating a new order
 */

import { Order } from '../entities/Order';
import { IOrderRepository, CreateOrderDTO } from '../repositories/IOrderRepository';

export class CreateOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(data: CreateOrderDTO): Promise<Order> {
    // Validate data
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Validate items
    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than 0');
      }
      if (item.priceCents < 0) {
        throw new Error('Item price cannot be negative');
      }
    }

    // Create order
    return await this.orderRepository.create(data);
  }
}
