/**
 * Supplier Service
 * Application-level service for supplier operations
 */

import { Supplier } from '@/lib/domain/entities/Supplier'
import { SupplierRepository } from '@/lib/infrastructure/supabase/repositories/SupplierRepository'
import { CreateSupplierDTO, UpdateSupplierDTO } from '@/lib/domain/repositories/ISupplierRepository'

export class SupplierService {
  private supplierRepository: SupplierRepository

  constructor() {
    this.supplierRepository = new SupplierRepository()
  }

  /**
   * Get supplier by ID
   */
  async getSupplier(id: string): Promise<Supplier | null> {
    return await this.supplierRepository.findById(id)
  }

  /**
   * Get all suppliers for an organization
   */
  async getSuppliers(orgId: string, activeOnly: boolean = true): Promise<Supplier[]> {
    return await this.supplierRepository.findByOrg(orgId, activeOnly)
  }

  /**
   * Get suppliers by category
   */
  async getSuppliersByCategory(orgId: string, category: string): Promise<Supplier[]> {
    return await this.supplierRepository.findByCategory(orgId, category)
  }

  /**
   * Get all categories
   */
  async getCategories(orgId: string): Promise<string[]> {
    return await this.supplierRepository.getCategories(orgId)
  }

  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierDTO): Promise<Supplier> {
    return await this.supplierRepository.create(data)
  }

  /**
   * Update a supplier
   */
  async updateSupplier(id: string, data: UpdateSupplierDTO): Promise<Supplier> {
    return await this.supplierRepository.update(id, data)
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: string): Promise<void> {
    return await this.supplierRepository.delete(id)
  }

  /**
   * Search suppliers
   */
  async searchSuppliers(orgId: string, query: string): Promise<Supplier[]> {
    return await this.supplierRepository.search(orgId, query)
  }

  /**
   * Get top-rated suppliers
   */
  async getTopRatedSuppliers(orgId: string, limit?: number): Promise<Supplier[]> {
    return await this.supplierRepository.getTopRated(orgId, limit)
  }

  /**
   * Toggle supplier active status
   */
  async toggleSupplierStatus(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id)
    if (!supplier) {
      throw new Error(`Supplier not found: ${id}`)
    }

    return await this.supplierRepository.update(id, {
      isActive: !supplier.isActive
    })
  }
}

