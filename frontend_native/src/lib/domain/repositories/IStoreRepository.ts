/**
 * Store Repository Interface
 * Defines the contract for store data access
 */

import { Store } from '../entities/Store';

export interface IStoreRepository {
  /**
   * Find store by ID
   */
  findById(id: string): Promise<Store | null>;

  /**
   * Find all stores for an organization
   */
  findByOrg(orgId: string): Promise<Store[]>;

  /**
   * Find stores accessible by a user
   */
  findByUser(userId: string): Promise<Store[]>;
}

