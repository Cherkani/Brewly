/**
 * Order Repository Implementation
 * Supabase implementation of IOrderRepository
 */

import {
  IOrderRepository,
  CreateOrderDTO,
  UpdateOrderDTO,
  AddPaymentDTO,
} from '@/lib/domain/repositories/IOrderRepository'
import { Order, OrderStatus } from '@/lib/domain/entities/Order'
import { supabase } from '../client'
import * as orderMapper from '../mappers/orderMapper'

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
  `

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(this.ORDER_SELECT)
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return orderMapper.toDomain(data)
  }

  async findByLocation(
    locationId: string,
    filters?: {
      status?: OrderStatus
      startDate?: Date
      endDate?: Date
    }
  ): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select(this.ORDER_SELECT)
      .eq('location_id', locationId)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString())
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString())
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map(orderMapper.toDomain)
  }

  async findByStatus(locationId: string, status: OrderStatus): Promise<Order[]> {
    return this.findByLocation(locationId, { status })
  }

  async getRecent(locationId: string, limit: number = 10): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(this.ORDER_SELECT)
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) {
      return []
    }

    return data.map(orderMapper.toDomain)
  }

  async create(dto: CreateOrderDTO): Promise<Order> {
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        org_id: dto.orgId,
        location_id: dto.locationId,
        cashier_id: dto.cashierId,
        discount_cents: dto.discountInCents || 0,
        notes: dto.notes,
        status: 'queued',
      })
      .select()
      .single()

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message}`)
    }

    // Create order items
    for (const item of dto.items) {
      // Calculate line total
      const modifiersTotal = item.modifierIds.length * 0 // Will be calculated properly
      const lineTotal = (item.basePriceInCents + modifiersTotal) * item.quantity

      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          org_id: dto.orgId,
          location_id: dto.locationId,
          order_id: order.id,
          product_id: item.productId,
          size_id: item.sizeId,
          qty: item.quantity,
          base_price_cents: item.basePriceInCents,
          line_total_cents: lineTotal,
        })
        .select()
        .single()

      if (itemError || !orderItem) {
        // Rollback: delete the order
        await supabase.from('orders').delete().eq('id', order.id)
        throw new Error(`Failed to create order item: ${itemError?.message}`)
      }

      // Create order item modifiers
      if (item.modifierIds.length > 0) {
        // Fetch modifier prices
        const { data: modifiers } = await supabase
          .from('modifiers')
          .select('id, price_delta_cents')
          .in('id', item.modifierIds)

        if (modifiers) {
          const modifierData = modifiers.map(mod => ({
            org_id: dto.orgId,
            location_id: dto.locationId,
            order_item_id: orderItem.id,
            modifier_id: mod.id,
            price_delta_cents: mod.price_delta_cents,
          }))

          const { error: modError } = await supabase
            .from('order_item_modifiers')
            .insert(modifierData)

          if (modError) {
            // Rollback
            await supabase.from('orders').delete().eq('id', order.id)
            throw new Error(`Failed to create modifiers: ${modError.message}`)
          }
        }
      }
    }

    // Fetch and return complete order
    const createdOrder = await this.findById(order.id)
    if (!createdOrder) {
      throw new Error('Failed to fetch created order')
    }

    return createdOrder
  }

  async update(id: string, dto: UpdateOrderDTO): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: dto.status,
        discount_cents: dto.discountInCents,
        notes: dto.notes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update order: ${error?.message}`)
    }

    const updatedOrder = await this.findById(id)
    if (!updatedOrder) {
      throw new Error('Failed to fetch updated order')
    }

    return updatedOrder
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.update(id, { status })
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('orders').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete order: ${error.message}`)
    }
  }

  async addPayment(dto: AddPaymentDTO): Promise<void> {
    const { error } = await supabase.from('payments').insert({
      order_id: dto.orderId,
      method: dto.method,
      amount_cents: dto.amountInCents,
      org_id: (await this.findById(dto.orderId))?.orgId,
      location_id: (await this.findById(dto.orderId))?.locationId,
    })

    if (error) {
      throw new Error(`Failed to add payment: ${error.message}`)
    }

    // Update order status to paid
    await this.updateStatus(dto.orderId, 'paid')
  }

  async getCountByStatus(
    locationId: string
  ): Promise<Record<OrderStatus, number>> {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('location_id', locationId)

    if (error || !data) {
      return {
        queued: 0,
        in_progress: 0,
        ready: 0,
        paid: 0,
        completed: 0,
        cancelled: 0,
      }
    }

    const counts = data.reduce((acc, order) => {
      acc[order.status as OrderStatus] = (acc[order.status as OrderStatus] || 0) + 1
      return acc
    }, {} as Record<OrderStatus, number>)

    return {
      queued: counts.queued || 0,
      in_progress: counts.in_progress || 0,
      ready: counts.ready || 0,
      paid: counts.paid || 0,
      completed: counts.completed || 0,
      cancelled: counts.cancelled || 0,
    }
  }

  subscribeToOrders(
    locationId: string,
    callback: (order: Order) => void
  ): () => void {
    const channel = supabase
      .channel(`orders:${locationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `location_id=eq.${locationId}`,
        },
        async (payload) => {
          if (payload.new && 'id' in payload.new) {
            const order = await this.findById(payload.new.id as string)
            if (order) {
              callback(order)
            }
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }
}

