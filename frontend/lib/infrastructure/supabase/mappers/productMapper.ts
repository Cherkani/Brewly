/**
 * Product Mapper
 * Converts between database models and domain entities
 */

import { Product } from '@/lib/domain/entities/Product'
import { ProductPrice } from '@/lib/domain/entities/ProductPrice'
import { ModifierGroup } from '@/lib/domain/entities/ModifierGroup'
import { Modifier } from '@/lib/domain/entities/Modifier'

/**
 * Map database product to domain entity
 */
export function toDomain(dbProduct: any): Product {
  // Map prices
  const prices: ProductPrice[] = (dbProduct.product_prices || []).map(
    (pp: any) =>
      new ProductPrice(
        pp.id,
        pp.product_id,
        pp.size_id,
        pp.sizes?.name || 'Unknown',
        pp.price_cents
      )
  )

  // Map modifier groups
  const modifierGroups: ModifierGroup[] = (
    dbProduct.product_modifier_groups || []
  ).map((pmg: any) => {
    const mg = pmg.modifier_groups
    const modifiers: Modifier[] = (mg.modifiers || []).map(
      (m: any) =>
        new Modifier(m.id, m.group_id, m.name, m.price_delta_cents)
    )

    return new ModifierGroup(
      mg.id,
      mg.name,
      mg.required,
      mg.min_choices,
      mg.max_choices,
      modifiers
    )
  })

  return new Product(
    dbProduct.id,
    dbProduct.org_id,
    dbProduct.location_id,
    dbProduct.name,
    dbProduct.category,
    dbProduct.image,
    dbProduct.is_active,
    prices,
    modifierGroups,
    new Date(dbProduct.created_at)
  )
}

/**
 * Map domain entity to database model
 */
export function toPersistence(product: Product): any {
  return {
    id: product.id,
    org_id: product.orgId,
    location_id: product.locationId,
    name: product.name,
    category: product.category,
    image: product.image,
    is_active: product.isActive,
  }
}

/**
 * Map create DTO to database insert
 */
export function createDTOToPersistence(dto: any): any {
  return {
    org_id: dto.orgId,
    location_id: dto.locationId,
    name: dto.name,
    category: dto.category,
    image: dto.image || null,
    is_active: dto.isActive !== undefined ? dto.isActive : true,
  }
}

