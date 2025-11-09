/**
 * Purchase Order Repository Interface
 * Defines the contract for purchase order data access
 */

import { PurchaseOrder, POStatus } from '../entities/PurchaseOrder'

export interface CreatePurchaseOrderDTO {
  orgId: string
  locationId: string
  supplierId: string
  orderNumber: string
  items: Array<{
    supplierProductId?: string | null
    itemName: string
    quantity: number
    unitPriceCents: number
    unit: string
  }>
  expectedDelivery?: Date | null
  notes?: string | null
}

export interface UpdatePurchaseOrderDTO {
  status?: POStatus
  expectedDelivery?: Date | null
  notes?: string | null
}

export interface IPurchaseOrderRepository {
  /**
   * Find purchase order by ID
   */
  findById(id: string): Promise<PurchaseOrder | null>

  /**
   * Find purchase orders for a location
   */
  findByLocation(
    locationId: string,
    filters?: {
      status?: POStatus
      supplierId?: string
      startDate?: Date
      endDate?: Date
    }
  ): Promise<PurchaseOrder[]>

  /**
   * Find purchase orders by status
   */
  findByStatus(locationId: string, status: POStatus): Promise<PurchaseOrder[]>

  /**
   * Find purchase orders by supplier
   */
  findBySupplier(supplierId: string): Promise<PurchaseOrder[]>

  /**
   * Get recent purchase orders
   */
  getRecent(locationId: string, limit?: number): Promise<PurchaseOrder[]>

  /**
   * Create a new purchase order
   */
  create(data: CreatePurchaseOrderDTO): Promise<PurchaseOrder>

  /**
   * Update an existing purchase order
   */
  update(id: string, data: UpdatePurchaseOrderDTO): Promise<PurchaseOrder>

  /**
   * Update purchase order status
   */
  updateStatus(id: string, status: POStatus): Promise<PurchaseOrder>

  /**
   * Delete a purchase order
   */
  delete(id: string): Promise<void>

  /**
   * Get purchase order count by status
   */
  getCountByStatus(locationId: string): Promise<Record<POStatus, number>>

  /**
   * Generate next order number
   */
  generateOrderNumber(orgId: string): Promise<string>
}

