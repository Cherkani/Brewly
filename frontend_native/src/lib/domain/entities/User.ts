/**
 * User Entity
 * Represents an authenticated user
 */

export type UserRole = 'superadmin' | 'developer' | 'admin' | 'cashier';

export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly metadata: UserMetadata,
    public readonly createdAt: Date
  ) {}

  /**
   * Get display name
   */
  getDisplayName(): string {
    return this.metadata.full_name || this.email;
  }

  /**
   * Get initials for avatar
   */
  getInitials(): string {
    const name = this.metadata.full_name || this.email;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Check if user has avatar
   */
  hasAvatar(): boolean {
    return !!this.metadata.avatar_url;
  }
}
