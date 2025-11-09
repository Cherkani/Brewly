/**
 * Ingredient Mapper
 * Converts between database models and domain entities
 */

import { Ingredient } from '@/lib/domain/entities/Ingredient'

/**
 * Map database ingredient to domain entity
 */
export function toDomain(dbIngredient: any): Ingredient {
  return new Ingredient(
    dbIngredient.id,
    dbIngredient.org_id,
    dbIngredient.location_id,
    dbIngredient.name,
    dbIngredient.unit,
    dbIngredient.on_hand,
    dbIngredient.low_stock_threshold,
    dbIngredient.unit_cost_cents,
    new Date(dbIngredient.created_at)
  )
}

/**
 * Map domain entity to database model
 */
export function toPersistence(ingredient: Ingredient): any {
  return {
    id: ingredient.id,
    org_id: ingredient.orgId,
    location_id: ingredient.locationId,
    name: ingredient.name,
    unit: ingredient.unit,
    on_hand: ingredient.onHand,
    low_stock_threshold: ingredient.lowStockThreshold,
    unit_cost_cents: ingredient.unitCostInCents,
  }
}

