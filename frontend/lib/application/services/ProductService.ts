/**
 * Product Service
 * Application-level service for product operations
 */

import { Product } from '@/lib/domain/entities/Product'
import { ProductRepository } from '@/lib/infrastructure/supabase/repositories/ProductRepository'
import { CreateProductDTO, UpdateProductDTO } from '@/lib/domain/repositories/IProductRepository'

export class ProductService {
  private productRepository: ProductRepository

  constructor() {
    this.productRepository = new ProductRepository()
  }

  /**
   * Get all products for a location
   */
  async getProducts(locationId: string, activeOnly: boolean = true): Promise<Product[]> {
    return await this.productRepository.findByLocation(locationId, activeOnly)
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product | null> {
    return await this.productRepository.findById(id)
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(locationId: string, category: string): Promise<Product[]> {
    return await this.productRepository.findByCategory(locationId, category)
  }

  /**
   * Get all categories for a location
   */
  async getCategories(locationId: string): Promise<string[]> {
    return await this.productRepository.getCategories(locationId)
  }

  /**
   * Search products
   */
  async searchProducts(locationId: string, query: string): Promise<Product[]> {
    return await this.productRepository.search(locationId, query)
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDTO): Promise<Product> {
    // Additional validation or business logic can go here
    return await this.productRepository.create(data)
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    return await this.productRepository.update(id, data)
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    return await this.productRepository.delete(id)
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id)
    if (!product) {
      throw new Error(`Product not found: ${id}`)
    }

    return await this.productRepository.update(id, {
      isActive: !product.isActive
    })
  }
}

