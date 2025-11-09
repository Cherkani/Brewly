/**
 * Purchase Order Mapper
 * Converts between database models and domain entities
 */

import { PurchaseOrder, POStatus, POItem } from '@/lib/domain/entities/PurchaseOrder'

/**
 * Map database purchase order to domain entity
 */
export function toDomain(dbPO: any): PurchaseOrder {
  const items: POItem[] = (dbPO.purchase_order_items || []).map((item: any) => ({
    id: item.id,
    supplierProductId: item.supplier_product_id,
    itemName: item.item_name,
    quantity: item.quantity,
    unitPriceCents: item.unit_price_cents,
    totalPriceCents: item.total_price_cents,
    unit: item.unit,
  }))

  return new PurchaseOrder(
    dbPO.id,
    dbPO.org_id,
    dbPO.location_id,
    dbPO.supplier_id,
    dbPO.suppliers?.name || 'Unknown Supplier',
    dbPO.order_number,
    dbPO.status as POStatus,
    dbPO.total_amount_cents,
    new Date(dbPO.order_date),
    dbPO.expected_delivery ? new Date(dbPO.expected_delivery) : null,
    dbPO.notes,
    items,
    new Date(dbPO.created_at)
  )
}

/**
 * Map domain entity to database model
 */
export function toPersistence(po: PurchaseOrder): any {
  return {
    id: po.id,
    org_id: po.orgId,
    location_id: po.locationId,
    supplier_id: po.supplierId,
    order_number: po.orderNumber,
    status: po.status,
    total_amount_cents: po.totalAmountCents,
    order_date: po.orderDate.toISOString(),
    expected_delivery: po.expectedDelivery?.toISOString(),
    notes: po.notes,
  }
}

