/**
 * Inventory Service
 * Application-level service for inventory operations
 */

import { Ingredient } from '@/lib/domain/entities/Ingredient'
import { IngredientRepository } from '@/lib/infrastructure/supabase/repositories/IngredientRepository'
import {
  CreateIngredientDTO,
  UpdateIngredientDTO,
  AdjustInventoryDTO,
} from '@/lib/domain/repositories/IIngredientRepository'

export class InventoryService {
  private ingredientRepository: IngredientRepository

  constructor() {
    this.ingredientRepository = new IngredientRepository()
  }

  /**
   * Get ingredient by ID
   */
  async getIngredient(id: string): Promise<Ingredient | null> {
    return await this.ingredientRepository.findById(id)
  }

  /**
   * Get all ingredients for a location
   */
  async getIngredients(locationId: string): Promise<Ingredient[]> {
    return await this.ingredientRepository.findByLocation(locationId)
  }

  /**
   * Get low stock ingredients
   */
  async getLowStockIngredients(locationId: string): Promise<Ingredient[]> {
    return await this.ingredientRepository.findLowStock(locationId)
  }

  /**
   * Get out of stock ingredients
   */
  async getOutOfStockIngredients(locationId: string): Promise<Ingredient[]> {
    return await this.ingredientRepository.findOutOfStock(locationId)
  }

  /**
   * Create a new ingredient
   */
  async createIngredient(data: CreateIngredientDTO): Promise<Ingredient> {
    return await this.ingredientRepository.create(data)
  }

  /**
   * Update an ingredient
   */
  async updateIngredient(id: string, data: UpdateIngredientDTO): Promise<Ingredient> {
    return await this.ingredientRepository.update(id, data)
  }

  /**
   * Delete an ingredient
   */
  async deleteIngredient(id: string): Promise<void> {
    return await this.ingredientRepository.delete(id)
  }

  /**
   * Adjust inventory quantity
   */
  async adjustInventory(data: AdjustInventoryDTO): Promise<Ingredient> {
    return await this.ingredientRepository.adjustInventory(data)
  }

  /**
   * Search ingredients
   */
  async searchIngredients(locationId: string, query: string): Promise<Ingredient[]> {
    return await this.ingredientRepository.search(locationId, query)
  }

  /**
   * Get total inventory value
   */
  async getTotalInventoryValue(locationId: string): Promise<number> {
    return await this.ingredientRepository.getTotalValue(locationId)
  }

  /**
   * Get inventory alerts (low stock + out of stock)
   */
  async getInventoryAlerts(locationId: string): Promise<{
    lowStock: Ingredient[]
    outOfStock: Ingredient[]
    totalAlerts: number
  }> {
    const [lowStock, outOfStock] = await Promise.all([
      this.getLowStockIngredients(locationId),
      this.getOutOfStockIngredients(locationId),
    ])

    return {
      lowStock,
      outOfStock,
      totalAlerts: lowStock.length + outOfStock.length,
    }
  }
}

