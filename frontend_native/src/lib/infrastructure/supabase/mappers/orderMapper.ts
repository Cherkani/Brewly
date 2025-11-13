/**
 * Order Mapper
 * Maps between database models and domain entities for orders
 */

import { Order, OrderStatus } from '@domain/entities/Order';
import { OrderItem } from '@domain/entities/OrderItem';

export function toDomain(data: any): Order {
  const items: OrderItem[] = (data.order_items || []).map((oi: any) =>
    new OrderItem(
      oi.id,
      data.id,
      oi.product_id,
      oi.quantity,
      oi.price_cents,
      oi.line_total_cents,
      new Date(oi.created_at)
    )
    );

  return new Order(
    data.id,
    data.org_id,
    data.store_id,
    data.number,
    data.status as OrderStatus,
    data.cashier_id,
    data.total_cents,
    items,
    data.notes || null,
    new Date(data.created_at)
  );
}
