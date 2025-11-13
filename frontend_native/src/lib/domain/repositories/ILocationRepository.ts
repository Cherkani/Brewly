/**
 * Location Repository Interface
 * Defines the contract for location data access
 */

import { Location } from '../entities/Location';

export interface ILocationRepository {
  /**
   * Find location by ID
   */
  findById(id: string): Promise<Location | null>;

  /**
   * Find all locations for an organization
   */
  findByOrg(orgId: string): Promise<Location[]>;

  /**
   * Find locations accessible by a user
   */
  findByUser(userId: string): Promise<Location[]>;
}

