/**
 * Order Repository Implementation
 * Supabase implementation for React Native
 */

import {
  IOrderRepository,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
} from '@domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '@domain/entities/Order';
import { supabase } from '../client';
import * as orderMapper from '../mappers/orderMapper';

export class OrderRepository implements IOrderRepository {
  private readonly ORDER_SELECT = `
    *,
    order_items (
      *,
      products (name),
      sizes (name),
      order_item_modifiers (
        *,
        modifiers (name)
      )
    )
  `;

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(this.ORDER_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return orderMapper.toDomain(data);
  }

  async findByLocation(
    locationId: string,
    status?: OrderStatus,
    limit: number = 50
  ): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select(this.ORDER_SELECT)
      .eq('location_id', locationId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(orderMapper.toDomain);
  }

  async getStats(locationId: string, date?: Date): Promise<{
    queued: number;
    in_progress: number;
    ready: number;
    paid: number;
    completed: number;
    cancelled: number;
  }> {
    let query = supabase
      .from('orders')
      .select('status')
      .eq('location_id', locationId);

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      return {
        queued: 0,
        in_progress: 0,
        ready: 0,
        paid: 0,
        completed: 0,
        cancelled: 0,
      };
    }

    const stats = data.reduce(
      (acc, order) => {
        acc[order.status as OrderStatus]++;
        return acc;
      },
      {
        queued: 0,
        in_progress: 0,
        ready: 0,
        paid: 0,
        completed: 0,
        cancelled: 0,
      }
    );

    return stats;
  }

  async create(dto: CreateOrderDTO): Promise<Order> {
    // This is a simplified version - in production, you'd want to handle this in a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        org_id: dto.orgId,
        location_id: dto.locationId,
        cashier_id: dto.cashierId,
        status: 'queued',
        discount_cents: dto.discountInCents || 0,
        notes: dto.notes,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message}`);
    }

    // Insert order items
    const orderItemsData = dto.items.map(item => ({
      org_id: dto.orgId,
      location_id: dto.locationId,
      order_id: order.id,
      product_id: item.productId,
      size_id: item.sizeId,
      qty: item.quantity,
      base_price_cents: item.basePriceInCents,
      line_total_cents: item.basePriceInCents * item.quantity, // Will be updated with modifiers
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select();

    if (itemsError || !insertedItems) {
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order items: ${itemsError?.message}`);
    }

    // Insert order item modifiers if any
    const modifierInserts: Array<{
      org_id: string;
      location_id: string;
      order_item_id: string;
      modifier_id: string;
      price_delta_cents: number;
    }> = [];

    // Note: This is a simplified version. In production, you'd fetch modifier prices from the database
    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      const insertedItem = insertedItems[i];
      
      if (item.modifierIds && item.modifierIds.length > 0 && insertedItem && insertedItem.id) {
        for (const modifierId of item.modifierIds) {
          modifierInserts.push({
            org_id: dto.orgId,
            location_id: dto.locationId,
            order_item_id: insertedItem.id,
            modifier_id: modifierId,
            price_delta_cents: 0, // Should fetch actual price from modifiers table
          });
        }
      }
    }

    if (modifierInserts.length > 0) {
      const { error: modifiersError } = await supabase
        .from('order_item_modifiers')
        .insert(modifierInserts);

      if (modifiersError) {
        // Rollback: delete order items and order
        await supabase.from('order_items').delete().eq('order_id', order.id);
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order item modifiers: ${modifiersError.message}`);
      }
    }

    // Fetch and return complete order
    const createdOrder = await this.findById(order.id);
    if (!createdOrder) {
      throw new Error('Failed to fetch created order');
    }

    return createdOrder;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDTO): Promise<Order> {
    const { error } = await supabase
      .from('orders')
      .update({ status: dto.status })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    const updatedOrder = await this.findById(id);
    if (!updatedOrder) {
      throw new Error('Failed to fetch updated order');
    }

    return updatedOrder;
  }

  async cancel(id: string): Promise<Order> {
    return this.updateStatus(id, { status: 'cancelled' });
  }

  subscribeToOrders(
    locationId: string,
    callback: (order: Order) => void
  ): () => void {
    const subscription = supabase
      .channel(`orders:${locationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `location_id=eq.${locationId}`,
        },
        async payload => {
          const order = await this.findById(payload.new.id as string);
          if (order) {
            callback(order);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

