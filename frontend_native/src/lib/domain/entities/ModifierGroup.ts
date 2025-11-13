/**
 * Modifier Group Entity
 * Represents a group of modifiers (e.g., "Milk Type", "Add-ons")
 */

import { Modifier } from './Modifier';

export class ModifierGroup {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly required: boolean,
    public readonly minChoices: number,
    public readonly maxChoices: number | null,
    public readonly modifiers: Modifier[],
    public readonly createdAt: Date
  ) {
    if (minChoices < 0) {
      throw new Error('minChoices cannot be negative');
    }
    if (maxChoices !== null && maxChoices < minChoices) {
      throw new Error('maxChoices cannot be less than minChoices');
    }
  }

  /**
   * Check if multiple selections are allowed
   */
  allowsMultipleSelections(): boolean {
    return this.maxChoices !== 1;
  }

  /**
   * Check if unlimited selections are allowed
   */
  hasUnlimitedSelections(): boolean {
    return this.maxChoices === null;
  }

  /**
   * Get description for UI
   */
  getDescription(): string {
    if (this.required) {
      if (this.maxChoices === 1) {
        return 'Required - Choose 1';
      } else if (this.maxChoices === null) {
        return `Required - Choose at least ${this.minChoices}`;
      } else {
        return `Required - Choose ${this.minChoices} to ${this.maxChoices}`;
      }
    } else {
      if (this.maxChoices === 1) {
        return 'Optional - Choose up to 1';
      } else if (this.maxChoices === null) {
        return 'Optional - Choose any';
      } else {
        return `Optional - Choose up to ${this.maxChoices}`;
      }
    }
  }
}

