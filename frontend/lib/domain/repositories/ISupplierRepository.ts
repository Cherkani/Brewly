/**
 * Supplier Repository Interface
 * Defines the contract for supplier data access
 */

import { Supplier } from '../entities/Supplier'

export interface CreateSupplierDTO {
  orgId: string
  name: string
  contactEmail?: string | null
  contactPhone?: string | null
  address?: string | null
  category?: string | null
  rating?: number | null
  isActive?: boolean
  paymentTerms?: string | null
  deliveryTime?: string | null
}

export interface UpdateSupplierDTO {
  name?: string
  contactEmail?: string | null
  contactPhone?: string | null
  address?: string | null
  category?: string | null
  rating?: number | null
  isActive?: boolean
  paymentTerms?: string | null
  deliveryTime?: string | null
}

export interface ISupplierRepository {
  /**
   * Find supplier by ID
   */
  findById(id: string): Promise<Supplier | null>

  /**
   * Find all suppliers for an organization
   */
  findByOrg(orgId: string, activeOnly?: boolean): Promise<Supplier[]>

  /**
   * Find suppliers by category
   */
  findByCategory(orgId: string, category: string): Promise<Supplier[]>

  /**
   * Get all unique categories for an organization
   */
  getCategories(orgId: string): Promise<string[]>

  /**
   * Create a new supplier
   */
  create(data: CreateSupplierDTO): Promise<Supplier>

  /**
   * Update an existing supplier
   */
  update(id: string, data: UpdateSupplierDTO): Promise<Supplier>

  /**
   * Delete a supplier
   */
  delete(id: string): Promise<void>

  /**
   * Search suppliers by name
   */
  search(orgId: string, query: string): Promise<Supplier[]>

  /**
   * Get top-rated suppliers
   */
  getTopRated(orgId: string, limit?: number): Promise<Supplier[]>
}

