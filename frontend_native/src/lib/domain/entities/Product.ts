/**
 * Product Entity
 * Pure business object representing a product in the catalog
 */

import { ProductPrice } from './ProductPrice';
import { ModifierGroup } from './ModifierGroup';

export class Product {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly locationId: string,
    public readonly name: string,
    public readonly category: string,
    public readonly image: string | null,
    public readonly isActive: boolean,
    public readonly prices: ProductPrice[],
    public readonly modifierGroups: ModifierGroup[],
    public readonly createdAt: Date
  ) {}

  /**
   * Check if product can be ordered
   */
  canBeOrdered(): boolean {
    return this.isActive && this.prices.length > 0;
  }

  /**
   * Get price for a specific size
   */
  getPriceForSize(sizeId: string): number | null {
    const price = this.prices.find(p => p.sizeId === sizeId);
    return price ? price.priceInCents / 100 : null;
  }

  /**
   * Get all available sizes
   */
  getAvailableSizes(): Array<{ id: string; name: string; price: number }> {
    return this.prices.map(p => ({
      id: p.sizeId,
      name: p.sizeName,
      price: p.priceInCents / 100
    }));
  }

  /**
   * Check if product has modifiers
   */
  hasModifiers(): boolean {
    return this.modifierGroups.length > 0;
  }

  /**
   * Get required modifier groups
   */
  getRequiredModifierGroups(): ModifierGroup[] {
    return this.modifierGroups.filter(g => g.required);
  }

  /**
   * Calculate total price with modifiers
   */
  calculateTotalPrice(
    sizeId: string,
    selectedModifierIds: string[]
  ): number | null {
    const basePrice = this.getPriceForSize(sizeId);
    if (basePrice === null) return null;

    let modifiersCost = 0;
    for (const modifierId of selectedModifierIds) {
      for (const group of this.modifierGroups) {
        const modifier = group.modifiers.find(m => m.id === modifierId);
        if (modifier) {
          modifiersCost += modifier.priceDeltaInCents / 100;
          break;
        }
      }
    }

    return basePrice + modifiersCost;
  }

  /**
   * Validate modifier selection
   */
  validateModifierSelection(selectedModifierIds: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const group of this.modifierGroups) {
      const selectedInGroup = selectedModifierIds.filter(id =>
        group.modifiers.some(m => m.id === id)
      );

      if (group.required && selectedInGroup.length === 0) {
        errors.push(`${group.name} is required`);
      }

      if (selectedInGroup.length < group.minChoices) {
        errors.push(
          `${group.name} requires at least ${group.minChoices} selection(s)`
        );
      }

      if (group.maxChoices && selectedInGroup.length > group.maxChoices) {
        errors.push(
          `${group.name} allows maximum ${group.maxChoices} selection(s)`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

