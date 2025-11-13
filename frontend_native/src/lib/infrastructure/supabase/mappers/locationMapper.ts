/**
 * Location Mapper
 * Maps between database models and domain entities for locations
 */

import { Location } from '@domain/entities/Location';

export function toDomain(data: any): Location {
  return new Location(
    data.id,
    data.org_id,
    data.name,
    data.address,
    data.timezone || 'UTC',
    data.is_active !== false,
    new Date(data.created_at)
  );
}

