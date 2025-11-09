/**
 * Purchase Order Service
 * Application-level service for purchase order operations
 */

import { PurchaseOrder, POStatus } from '@/lib/domain/entities/PurchaseOrder'
import { PurchaseOrderRepository } from '@/lib/infrastructure/supabase/repositories/PurchaseOrderRepository'
import { CreatePurchaseOrderDTO, UpdatePurchaseOrderDTO } from '@/lib/domain/repositories/IPurchaseOrderRepository'

export class PurchaseOrderService {
  private purchaseOrderRepository: PurchaseOrderRepository

  constructor() {
    this.purchaseOrderRepository = new PurchaseOrderRepository()
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    return await this.purchaseOrderRepository.findById(id)
  }

  /**
   * Get purchase orders for a location
   */
  async getPurchaseOrders(
    locationId: string,
    filters?: {
      status?: POStatus
      supplierId?: string
      startDate?: Date
      endDate?: Date
    }
  ): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepository.findByLocation(locationId, filters)
  }

  /**
   * Get purchase orders by status
   */
  async getPurchaseOrdersByStatus(
    locationId: string,
    status: POStatus
  ): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepository.findByStatus(locationId, status)
  }

  /**
   * Get purchase orders by supplier
   */
  async getPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepository.findBySupplier(supplierId)
  }

  /**
   * Get recent purchase orders
   */
  async getRecentPurchaseOrders(locationId: string, limit?: number): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepository.getRecent(locationId, limit)
  }

  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(data: CreatePurchaseOrderDTO): Promise<PurchaseOrder> {
    return await this.purchaseOrderRepository.create(data)
  }

  /**
   * Update a purchase order
   */
  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderDTO): Promise<PurchaseOrder> {
    return await this.purchaseOrderRepository.update(id, data)
  }

  /**
   * Update purchase order status
   */
  async updatePurchaseOrderStatus(id: string, newStatus: POStatus): Promise<PurchaseOrder> {
    // Validate status transition
    const po = await this.purchaseOrderRepository.findById(id)
    if (!po) {
      throw new Error(`Purchase order not found: ${id}`)
    }

    const allowedStatuses = po.getNextPossibleStatuses()
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${po.status} to ${newStatus}. ` +
        `Allowed transitions: ${allowedStatuses.join(', ')}`
      )
    }

    return await this.purchaseOrderRepository.updateStatus(id, newStatus)
  }

  /**
   * Delete a purchase order
   */
  async deletePurchaseOrder(id: string): Promise<void> {
    return await this.purchaseOrderRepository.delete(id)
  }

  /**
   * Get purchase order count by status
   */
  async getPurchaseOrderCountByStatus(
    locationId: string
  ): Promise<Record<POStatus, number>> {
    return await this.purchaseOrderRepository.getCountByStatus(locationId)
  }

  /**
   * Generate next order number
   */
  async generateOrderNumber(orgId: string): Promise<string> {
    return await this.purchaseOrderRepository.generateOrderNumber(orgId)
  }

  /**
   * Send purchase order
   */
  async sendPurchaseOrder(id: string): Promise<PurchaseOrder> {
    return await this.updatePurchaseOrderStatus(id, 'sent')
  }

  /**
   * Confirm purchase order
   */
  async confirmPurchaseOrder(id: string): Promise<PurchaseOrder> {
    return await this.updatePurchaseOrderStatus(id, 'confirmed')
  }

  /**
   * Receive purchase order
   */
  async receivePurchaseOrder(id: string): Promise<PurchaseOrder> {
    // TODO: Update inventory when receiving
    return await this.updatePurchaseOrderStatus(id, 'received')
  }

  /**
   * Cancel purchase order
   */
  async cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
    return await this.updatePurchaseOrderStatus(id, 'cancelled')
  }
}

