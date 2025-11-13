/**
 * Product Mapper
 * Maps between database models and domain entities for products
 */

import { Product } from '@domain/entities/Product';

export function toDomain(data: any): Product {
  return new Product(
    data.id,
    data.org_id,
    data.store_id,
    data.name,
    data.category,
    data.price_cents,
    data.is_active !== false,
    data.image_url || null,
    new Date(data.created_at)
  );
}

/**
 * Map create DTO to database insert
 */
export function createDTOToPersistence(dto: any): any {
  return {
    org_id: dto.orgId,
    store_id: dto.storeId,
    name: dto.name,
    category: dto.category || null,
    price_cents: dto.priceCents,
    image_url: dto.imageUrl || null,
    is_active: dto.isActive !== undefined ? dto.isActive : true,
  };
}

/**
 * Map update DTO to database update
 */
export function updateDTOToPersistence(dto: any): any {
  const update: any = {};
  
  if (dto.name !== undefined) update.name = dto.name;
  if (dto.category !== undefined) update.category = dto.category || null;
  if (dto.priceCents !== undefined) update.price_cents = dto.priceCents;
  if (dto.imageUrl !== undefined) update.image_url = dto.imageUrl || null;
  if (dto.isActive !== undefined) update.is_active = dto.isActive;
  
  return update;
}
