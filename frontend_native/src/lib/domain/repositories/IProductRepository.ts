/**
 * Product Repository Interface
 * Defines the contract for product data access
 */

import { Product } from '../entities/Product';

export interface CreateProductDTO {
  orgId: string;
  storeId: string;
  name: string;
  category: string | null;
  priceCents: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  category?: string | null;
  priceCents?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface IProductRepository {
  /**
   * Find product by ID
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find all products for a store
   */
  findByStore(storeId: string, activeOnly?: boolean): Promise<Product[]>;

  /**
   * Find products by category
   */
  findByCategory(storeId: string, category: string): Promise<Product[]>;

  /**
   * Get all unique categories for a store
   */
  getCategories(storeId: string): Promise<string[]>;

  /**
   * Search products by name
   */
  search(storeId: string, query: string): Promise<Product[]>;

  /**
   * Create a new product
   */
  create(data: CreateProductDTO): Promise<Product>;

  /**
   * Update an existing product
   */
  update(id: string, data: UpdateProductDTO): Promise<Product>;

  /**
   * Delete a product
   */
  delete(id: string): Promise<void>;
}
