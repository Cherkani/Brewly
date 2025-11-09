/**
 * ModifierGroup Entity
 * Represents a group of modifiers (e.g., Milk Type, Toppings)
 */

import { Modifier } from './Modifier'

export class ModifierGroup {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly required: boolean,
    public readonly minChoices: number,
    public readonly maxChoices: number | null,
    public readonly modifiers: Modifier[]
  ) {
    if (minChoices < 0) {
      throw new Error('minChoices cannot be negative')
    }
    if (maxChoices !== null && maxChoices < minChoices) {
      throw new Error('maxChoices cannot be less than minChoices')
    }
  }

  /**
   * Check if selection count is valid
   */
  isValidSelectionCount(count: number): boolean {
    if (count < this.minChoices) return false
    if (this.maxChoices !== null && count > this.maxChoices) return false
    return true
  }

  /**
   * Check if this is a single-choice group
   */
  isSingleChoice(): boolean {
    return this.maxChoices === 1
  }

  /**
   * Check if this is a multi-choice group
   */
  isMultiChoice(): boolean {
    return this.maxChoices === null || this.maxChoices > 1
  }

  /**
   * Get selection instructions for UI
   */
  getSelectionInstructions(): string {
    if (this.required) {
      if (this.isSingleChoice()) {
        return 'Required - Select one'
      }
      if (this.maxChoices === null) {
        return `Required - Select at least ${this.minChoices}`
      }
      return `Required - Select ${this.minChoices} to ${this.maxChoices}`
    } else {
      if (this.maxChoices === null) {
        return 'Optional'
      }
      return `Optional - Maximum ${this.maxChoices}`
    }
  }
}

