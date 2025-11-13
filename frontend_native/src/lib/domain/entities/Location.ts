/**
 * Location Entity
 * Represents a physical store location
 */

export class Location {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly name: string,
    public readonly address: string | null,
    public readonly timezone: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {}

  /**
   * Get display name with address
   */
  getFullName(): string {
    return this.address ? `${this.name} - ${this.address}` : this.name;
  }

  /**
   * Check if location is operational
   */
  isOperational(): boolean {
    return this.isActive;
  }
}

