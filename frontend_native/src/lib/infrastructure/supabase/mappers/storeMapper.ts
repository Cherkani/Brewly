/**
 * Store Mapper
 * Maps between database models and domain entities for stores
 */

import { Store } from '@domain/entities/Store';

export function toDomain(data: any): Store {
  return new Store(
    data.id,
    data.org_id,
    data.name,
    data.address || null,
    data.is_active !== false,
    new Date(data.created_at)
  );
}

