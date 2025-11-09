/**
 * Ingredient Repository Interface
 * Defines the contract for ingredient data access
 */

import { Ingredient } from '../entities/Ingredient'

export interface CreateIngredientDTO {
  orgId: string
  locationId: string
  name: string
  unit: string
  onHand?: number
  lowStockThreshold?: number
  unitCostInCents?: number
}

export interface UpdateIngredientDTO {
  name?: string
  unit?: string
  onHand?: number
  lowStockThreshold?: number
  unitCostInCents?: number
}

export interface AdjustInventoryDTO {
  ingredientId: string
  type: 'purchase' | 'production' | 'waste' | 'adjustment'
  quantity: number
  unitCostInCents?: number
  notes?: string
}

export interface IIngredientRepository {
  /**
   * Find ingredient by ID
   */
  findById(id: string): Promise<Ingredient | null>

  /**
   * Find all ingredients for a location
   */
  findByLocation(locationId: string): Promise<Ingredient[]>

  /**
   * Find low stock ingredients
   */
  findLowStock(locationId: string): Promise<Ingredient[]>

  /**
   * Find out of stock ingredients
   */
  findOutOfStock(locationId: string): Promise<Ingredient[]>

  /**
   * Create a new ingredient
   */
  create(data: CreateIngredientDTO): Promise<Ingredient>

  /**
   * Update an existing ingredient
   */
  update(id: string, data: UpdateIngredientDTO): Promise<Ingredient>

  /**
   * Delete an ingredient
   */
  delete(id: string): Promise<void>

  /**
   * Adjust inventory quantity
   */
  adjustInventory(data: AdjustInventoryDTO): Promise<Ingredient>

  /**
   * Search ingredients by name
   */
  search(locationId: string, query: string): Promise<Ingredient[]>

  /**
   * Get total inventory value
   */
  getTotalValue(locationId: string): Promise<number>
}

