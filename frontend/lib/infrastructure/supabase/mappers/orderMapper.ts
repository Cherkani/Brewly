/**
 * Order Mapper
 * Converts between database models and domain entities
 */

import { Order, OrderStatus } from '@/lib/domain/entities/Order'
import { OrderItem, OrderItemModifier } from '@/lib/domain/entities/OrderItem'

/**
 * Map database order to domain entity
 */
export function toDomain(dbOrder: any): Order {
  // Map order items
  const items: OrderItem[] = (dbOrder.order_items || []).map((oi: any) => {
    // Map modifiers
    const modifiers: OrderItemModifier[] = (oi.order_item_modifiers || []).map(
      (oim: any) => ({
        id: oim.modifier_id,
        name: oim.modifiers?.name || 'Unknown',
        priceDeltaInCents: oim.price_delta_cents,
      })
    )

    return new OrderItem(
      oi.id,
      oi.order_id,
      oi.product_id,
      oi.products?.name || 'Unknown',
      oi.size_id,
      oi.sizes?.name || 'Unknown',
      oi.qty,
      oi.base_price_cents,
      oi.line_total_cents,
      modifiers
    )
  })

  return new Order(
    dbOrder.id,
    dbOrder.org_id,
    dbOrder.location_id,
    dbOrder.number,
    dbOrder.status as OrderStatus,
    dbOrder.cashier_id,
    items,
    dbOrder.discount_cents,
    dbOrder.notes,
    new Date(dbOrder.created_at)
  )
}

/**
 * Map domain entity to database model
 */
export function toPersistence(order: Order): any {
  return {
    id: order.id,
    org_id: order.orgId,
    location_id: order.locationId,
    status: order.status,
    cashier_id: order.cashierId,
    discount_cents: order.discountInCents,
    notes: order.notes,
  }
}

