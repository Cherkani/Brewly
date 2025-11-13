/**
 * Product Repository Interface
 * Defines the contract for product data access
 */

import { Product } from '../entities/Product';

export interface CreateProductDTO {
  orgId: string;
  locationId: string;
  name: string;
  category: string;
  image?: string | null;
  isActive?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  category?: string;
  image?: string | null;
  isActive?: boolean;
}

export interface IProductRepository {
  /**
   * Find product by ID
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find all products for a location
   */
  findByLocation(locationId: string, activeOnly?: boolean): Promise<Product[]>;

  /**
   * Find products by category
   */
  findByCategory(locationId: string, category: string): Promise<Product[]>;

  /**
   * Get all unique categories for a location
   */
  getCategories(locationId: string): Promise<string[]>;

  /**
   * Search products by name
   */
  search(locationId: string, query: string): Promise<Product[]>;
}

