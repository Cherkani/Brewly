/**
 * Order Mapper
 * Maps between database models and domain entities for orders
 */

import { Order, OrderStatus } from '@domain/entities/Order';
import { OrderItem, OrderItemModifier } from '@domain/entities/OrderItem';

export function toDomain(data: any): Order {
  const items: OrderItem[] = (data.order_items || []).map((oi: any) => {
    const modifiers: OrderItemModifier[] = (oi.order_item_modifiers || []).map((oim: any) => ({
      id: oim.modifier_id,
      name: oim.modifiers?.name || '',
      priceDeltaInCents: oim.price_delta_cents,
    }));

    return new OrderItem(
      oi.id,
      data.id,
      oi.product_id,
      oi.products?.name || '',
      oi.size_id,
      oi.sizes?.name || '',
      oi.qty,
      oi.base_price_cents,
      oi.line_total_cents,
      modifiers,
      new Date(oi.created_at)
    );
  });

  return new Order(
    data.id,
    data.org_id,
    data.location_id,
    data.number,
    data.status as OrderStatus,
    data.cashier_id,
    items,
    data.discount_cents || 0,
    data.notes,
    new Date(data.created_at)
  );
}

