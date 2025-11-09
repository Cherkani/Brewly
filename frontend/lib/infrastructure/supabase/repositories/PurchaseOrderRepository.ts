/**
 * Purchase Order Repository Implementation
 * Supabase implementation of IPurchaseOrderRepository
 */

import {
  IPurchaseOrderRepository,
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO,
} from '@/lib/domain/repositories/IPurchaseOrderRepository'
import { PurchaseOrder, POStatus } from '@/lib/domain/entities/PurchaseOrder'
import { supabase } from '../client'
import * as poMapper from '../mappers/purchaseOrderMapper'

export class PurchaseOrderRepository implements IPurchaseOrderRepository {
  private readonly PO_SELECT = `
    *,
    suppliers (name),
    purchase_order_items (*)
  `

  async findById(id: string): Promise<PurchaseOrder | null> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(this.PO_SELECT)
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return poMapper.toDomain(data)
  }

  async findByLocation(
    locationId: string,
    filters?: {
      status?: POStatus
      supplierId?: string
      startDate?: Date
      endDate?: Date
    }
  ): Promise<PurchaseOrder[]> {
    let query = supabase
      .from('purchase_orders')
      .select(this.PO_SELECT)
      .eq('location_id', locationId)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId)
    }

    if (filters?.startDate) {
      query = query.gte('order_date', filters.startDate.toISOString())
    }

    if (filters?.endDate) {
      query = query.lte('order_date', filters.endDate.toISOString())
    }

    const { data, error } = await query.order('order_date', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map(poMapper.toDomain)
  }

  async findByStatus(locationId: string, status: POStatus): Promise<PurchaseOrder[]> {
    return this.findByLocation(locationId, { status })
  }

  async findBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(this.PO_SELECT)
      .eq('supplier_id', supplierId)
      .order('order_date', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map(poMapper.toDomain)
  }

  async getRecent(locationId: string, limit: number = 10): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(this.PO_SELECT)
      .eq('location_id', locationId)
      .order('order_date', { ascending: false })
      .limit(limit)

    if (error || !data) {
      return []
    }

    return data.map(poMapper.toDomain)
  }

  async create(dto: CreatePurchaseOrderDTO): Promise<PurchaseOrder> {
    // Calculate total
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceCents,
      0
    )

    // Create purchase order
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        org_id: dto.orgId,
        location_id: dto.locationId,
        supplier_id: dto.supplierId,
        order_number: dto.orderNumber,
        status: 'draft',
        total_amount_cents: totalAmount,
        order_date: new Date().toISOString(),
        expected_delivery: dto.expectedDelivery?.toISOString(),
        notes: dto.notes,
      })
      .select()
      .single()

    if (poError || !po) {
      throw new Error(`Failed to create purchase order: ${poError?.message}`)
    }

    // Create purchase order items
    const itemsData = dto.items.map(item => ({
      purchase_order_id: po.id,
      supplier_product_id: item.supplierProductId,
      item_name: item.itemName,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      total_price_cents: item.quantity * item.unitPriceCents,
      unit: item.unit,
    }))

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsData)

    if (itemsError) {
      // Rollback: delete the purchase order
      await supabase.from('purchase_orders').delete().eq('id', po.id)
      throw new Error(`Failed to create purchase order items: ${itemsError.message}`)
    }

    // Fetch and return complete purchase order
    const createdPO = await this.findById(po.id)
    if (!createdPO) {
      throw new Error('Failed to fetch created purchase order')
    }

    return createdPO
  }

  async update(id: string, dto: UpdatePurchaseOrderDTO): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({
        status: dto.status,
        expected_delivery: dto.expectedDelivery?.toISOString(),
        notes: dto.notes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update purchase order: ${error?.message}`)
    }

    const updatedPO = await this.findById(id)
    if (!updatedPO) {
      throw new Error('Failed to fetch updated purchase order')
    }

    return updatedPO
  }

  async updateStatus(id: string, status: POStatus): Promise<PurchaseOrder> {
    return this.update(id, { status })
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('purchase_orders').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete purchase order: ${error.message}`)
    }
  }

  async getCountByStatus(locationId: string): Promise<Record<POStatus, number>> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('status')
      .eq('location_id', locationId)

    if (error || !data) {
      return {
        draft: 0,
        sent: 0,
        confirmed: 0,
        received: 0,
        cancelled: 0,
      }
    }

    const counts = data.reduce((acc, po) => {
      acc[po.status as POStatus] = (acc[po.status as POStatus] || 0) + 1
      return acc
    }, {} as Record<POStatus, number>)

    return {
      draft: counts.draft || 0,
      sent: counts.sent || 0,
      confirmed: counts.confirmed || 0,
      received: counts.received || 0,
      cancelled: counts.cancelled || 0,
    }
  }

  async generateOrderNumber(orgId: string): Promise<string> {
    // Get the latest order number for this org
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('order_number')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      return 'PO-1001'
    }

    // Extract number and increment
    const lastNumber = data[0].order_number
    const match = lastNumber.match(/PO-(\d+)/)
    if (match) {
      const nextNumber = parseInt(match[1]) + 1
      return `PO-${nextNumber}`
    }

    return 'PO-1001'
  }
}

