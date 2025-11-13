/**
 * Product Mapper
 * Maps between database models and domain entities for products
 */

import { Product } from '@domain/entities/Product';
import { ProductPrice } from '@domain/entities/ProductPrice';
import { ModifierGroup } from '@domain/entities/ModifierGroup';
import { Modifier } from '@domain/entities/Modifier';

export function toDomain(data: any): Product {
  const prices: ProductPrice[] = (data.product_prices || []).map((pp: any) => 
    new ProductPrice(
      pp.id,
      data.id,
      pp.size_id,
      pp.sizes?.name || '',
      pp.price_cents,
      new Date(pp.created_at)
    )
  );

  const modifierGroups: ModifierGroup[] = (data.product_modifier_groups || []).map((pmg: any) => {
    const mg = pmg.modifier_groups;
    const modifiers: Modifier[] = (mg.modifiers || []).map((m: any) =>
      new Modifier(
        m.id,
        mg.id,
        m.name,
        m.price_delta_cents,
        new Date(m.created_at)
      )
    );

    return new ModifierGroup(
      mg.id,
      mg.name,
      mg.required,
      mg.min_choices,
      mg.max_choices,
      modifiers,
      new Date(mg.created_at)
    );
  });

  return new Product(
    data.id,
    data.org_id,
    data.location_id,
    data.name,
    data.category,
    data.image,
    data.is_active,
    prices,
    modifierGroups,
    new Date(data.created_at)
  );
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
  };
}

