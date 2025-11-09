/**
 * Ingredient Repository Implementation
 * Supabase implementation of IIngredientRepository
 */

import {
  IIngredientRepository,
  CreateIngredientDTO,
  UpdateIngredientDTO,
  AdjustInventoryDTO,
} from '@/lib/domain/repositories/IIngredientRepository'
import { Ingredient } from '@/lib/domain/entities/Ingredient'
import { supabase } from '../client'
import * as ingredientMapper from '../mappers/ingredientMapper'

export class IngredientRepository implements IIngredientRepository {
  async findById(id: string): Promise<Ingredient | null> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return ingredientMapper.toDomain(data)
  }

  async findByLocation(locationId: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('location_id', locationId)
      .order('name')

    if (error || !data) {
      return []
    }

    return data.map(ingredientMapper.toDomain)
  }

  async findLowStock(locationId: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('location_id', locationId)
      .filter('on_hand', 'lte', 'low_stock_threshold')
      .gt('on_hand', 0)
      .order('on_hand')

    if (error || !data) {
      return []
    }

    return data.map(ingredientMapper.toDomain)
  }

  async findOutOfStock(locationId: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('location_id', locationId)
      .eq('on_hand', 0)
      .order('name')

    if (error || !data) {
      return []
    }

    return data.map(ingredientMapper.toDomain)
  }

  async create(dto: CreateIngredientDTO): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        org_id: dto.orgId,
        location_id: dto.locationId,
        name: dto.name,
        unit: dto.unit,
        on_hand: dto.onHand || 0,
        low_stock_threshold: dto.lowStockThreshold || 0,
        unit_cost_cents: dto.unitCostInCents || 0,
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to create ingredient: ${error?.message}`)
    }

    return ingredientMapper.toDomain(data)
  }

  async update(id: string, dto: UpdateIngredientDTO): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .update({
        name: dto.name,
        unit: dto.unit,
        on_hand: dto.onHand,
        low_stock_threshold: dto.lowStockThreshold,
        unit_cost_cents: dto.unitCostInCents,
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update ingredient: ${error?.message}`)
    }

    return ingredientMapper.toDomain(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('ingredients').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete ingredient: ${error.message}`)
    }
  }

  async adjustInventory(dto: AdjustInventoryDTO): Promise<Ingredient> {
    // Get current ingredient
    const ingredient = await this.findById(dto.ingredientId)
    if (!ingredient) {
      throw new Error(`Ingredient not found: ${dto.ingredientId}`)
    }

    // Calculate new quantity
    const newQuantity = ingredient.onHand + dto.quantity

    if (newQuantity < 0) {
      throw new Error('Insufficient inventory')
    }

    // Update ingredient
    const { data, error } = await supabase
      .from('ingredients')
      .update({
        on_hand: newQuantity,
      })
      .eq('id', dto.ingredientId)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to adjust inventory: ${error?.message}`)
    }

    // Create transaction record
    await supabase.from('inventory_tx').insert({
      org_id: ingredient.orgId,
      location_id: ingredient.locationId,
      ingredient_id: dto.ingredientId,
      type: dto.type,
      qty: dto.quantity,
      unit_cost_cents: dto.unitCostInCents,
      notes: dto.notes,
    })

    return ingredientMapper.toDomain(data)
  }

  async search(locationId: string, query: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('location_id', locationId)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20)

    if (error || !data) {
      return []
    }

    return data.map(ingredientMapper.toDomain)
  }

  async getTotalValue(locationId: string): Promise<number> {
    const ingredients = await this.findByLocation(locationId)
    return ingredients.reduce(
      (total, ingredient) => total + ingredient.calculateStockValue(),
      0
    )
  }
}

