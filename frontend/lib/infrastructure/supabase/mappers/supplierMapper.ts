/**
 * Supplier Mapper
 * Converts between database models and domain entities
 */

import { Supplier } from '@/lib/domain/entities/Supplier'

/**
 * Map database supplier to domain entity
 */
export function toDomain(dbSupplier: any): Supplier {
  return new Supplier(
    dbSupplier.id,
    dbSupplier.org_id,
    dbSupplier.name,
    dbSupplier.contact_email,
    dbSupplier.contact_phone,
    dbSupplier.address,
    dbSupplier.category,
    dbSupplier.rating,
    dbSupplier.is_active,
    dbSupplier.payment_terms,
    dbSupplier.delivery_time,
    new Date(dbSupplier.created_at)
  )
}

/**
 * Map domain entity to database model
 */
export function toPersistence(supplier: Supplier): any {
  return {
    id: supplier.id,
    org_id: supplier.orgId,
    name: supplier.name,
    contact_email: supplier.contactEmail,
    contact_phone: supplier.contactPhone,
    address: supplier.address,
    category: supplier.category,
    rating: supplier.rating,
    is_active: supplier.isActive,
    payment_terms: supplier.paymentTerms,
    delivery_time: supplier.deliveryTime,
  }
}

