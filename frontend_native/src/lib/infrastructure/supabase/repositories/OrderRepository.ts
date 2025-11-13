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
    order_items (*)
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

  async findByStore(
    storeId: string,
    status?: OrderStatus,
    limit: number = 50
  ): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select(this.ORDER_SELECT)
      .eq('store_id', storeId);

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

  async getStats(storeId: string, date?: Date): Promise<{
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
      .eq('store_id', storeId);

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
    // Calculate total from items
    const totalCents = dto.items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        org_id: dto.orgId,
        store_id: dto.storeId,
        cashier_id: dto.cashierId,
        status: 'queued',
        total_cents: totalCents,
        notes: dto.notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message}`);
    }

    // Insert order items
    const orderItemsData = dto.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_cents: item.priceCents,
      line_total_cents: item.priceCents * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
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
    storeId: string,
    callback: (order: Order) => void
  ): () => void {
    const subscription = supabase
      .channel(`orders:${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        async payload => {
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            const order = await this.findById(payload.new.id as string);
            if (order) {
              callback(order);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}
