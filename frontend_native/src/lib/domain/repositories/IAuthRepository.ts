/**
 * Auth Repository Interface
 * Defines the contract for authentication operations
 */

import { User } from '../entities/User';

export interface SignUpDTO {
  email: string;
  password: string;
  fullName: string;
  role?: 'superadmin' | 'admin' | 'developer' | 'cashier';
}

export interface SignInDTO {
  email: string;
  password: string;
}

export interface IAuthRepository {
  /**
   * Sign up a new user
   */
  signUp(data: SignUpDTO): Promise<User>;

  /**
   * Sign in an existing user
   */
  signIn(data: SignInDTO): Promise<User>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Get current user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Reset password
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Update password
   */
  updatePassword(newPassword: string): Promise<void>;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}

