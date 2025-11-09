/**
 * Create Order Use Case
 * Business logic for creating a new order
 */

import { IOrderRepository, CreateOrderDTO } from '../repositories/IOrderRepository'
import { IProductRepository } from '../repositories/IProductRepository'
import { Order } from '../entities/Order'

export interface CreateOrderInput {
  orgId: string
  locationId: string
  cashierId: string
  items: Array<{
    productId: string
    sizeId: string
    quantity: number
    modifierIds: string[]
  }>
  discountInCents?: number
  notes?: string | null
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    // 1. Validate input
    this.validateInput(input)

    // 2. Validate and calculate prices for each item
    const itemsWithPrices = await Promise.all(
      input.items.map(item => this.calculateItemPrice(item))
    )

    // 3. Create order DTO
    const orderDTO: CreateOrderDTO = {
      orgId: input.orgId,
      locationId: input.locationId,
      cashierId: input.cashierId,
      items: itemsWithPrices,
      discountInCents: input.discountInCents || 0,
      notes: input.notes
    }

    // 4. Persist order
    const order = await this.orderRepository.create(orderDTO)

    return order
  }

  private validateInput(input: CreateOrderInput): void {
    if (!input.orgId) {
      throw new Error('Organization ID is required')
    }

    if (!input.locationId) {
      throw new Error('Location ID is required')
    }

    if (!input.cashierId) {
      throw new Error('Cashier ID is required')
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('Order must have at least one item')
    }

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than 0')
      }
    }

    if (input.discountInCents && input.discountInCents < 0) {
      throw new Error('Discount cannot be negative')
    }
  }

  private async calculateItemPrice(item: {
    productId: string
    sizeId: string
    quantity: number
    modifierIds: string[]
  }): Promise<{
    productId: string
    sizeId: string
    quantity: number
    basePriceInCents: number
    modifierIds: string[]
  }> {
    // Fetch product
    const product = await this.productRepository.findById(item.productId)
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`)
    }

    // Check if product can be ordered
    if (!product.canBeOrdered()) {
      throw new Error(`Product cannot be ordered: ${product.name}`)
    }

    // Get base price for size
    const basePrice = product.getPriceForSize(item.sizeId)
    if (basePrice === null) {
      throw new Error(`Price not found for product ${product.name} with size ${item.sizeId}`)
    }

    // Validate modifier selection
    const modifierValidation = product.validateModifierSelection(item.modifierIds)
    if (!modifierValidation.valid) {
      throw new Error(`Invalid modifier selection for ${product.name}: ${modifierValidation.errors.join(', ')}`)
    }

    return {
      productId: item.productId,
      sizeId: item.sizeId,
      quantity: item.quantity,
      basePriceInCents: Math.round(basePrice * 100),
      modifierIds: item.modifierIds
    }
  }
}

