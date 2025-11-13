/**
 * Auth Repository Implementation
 * Supabase implementation for React Native
 */

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import {
  IAuthRepository,
  SignUpDTO,
  SignInDTO,
} from '@domain/repositories/IAuthRepository';
import { User } from '@domain/entities/User';
import { supabase } from '../client';
import * as userMapper from '../mappers/userMapper';

export class AuthRepository implements IAuthRepository {
  /**
   * Ensure user has a default role, create one if missing
   * First tries to use the database function, then falls back to direct insert
   */
  private async ensureDefaultUserRole(userId: string): Promise<void> {
    try {
      // First, try using the database function (if it exists)
      const { error: rpcError } = await supabase.rpc('ensure_default_user_role');

      if (!rpcError) {
        // Function call succeeded
        return;
      }

      // If RPC function doesn't exist or fails, try direct insert
      // This will work if the RLS policy allows it
      await this.createDefaultUserRoleDirect(userId);
    } catch (error) {
      console.error('Error ensuring default user role:', error);
      // Don't throw - user can still use the app, admin can assign roles later
    }
  }

  /**
   * Directly create default user role (fallback method)
   * Uses RLS policy that allows users to create their own default cashier role
   */
  private async createDefaultUserRoleDirect(userId: string): Promise<void> {
    try {
      // Get the first organization
      const { data: orgs, error: orgsError } = await supabase
        .from('orgs')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (orgsError || !orgs) {
        console.warn('No organizations found, skipping default role creation');
        return;
      }

      // Get the first active store for this organization
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('org_id', orgs.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (storesError || !stores) {
        console.warn('No active stores found, skipping default role creation');
        return;
      }

      // Check if user already has a default role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .limit(1)
        .single();

      if (existingRole) {
        // User already has a default role
        return;
      }

      // Create default cashier role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'cashier',
          org_id: orgs.id,
          store_id: stores.id,
          is_default: true,
        });

      if (roleError) {
        console.error('Failed to create default user role:', roleError);
        // Don't throw - user can still use the app, admin can assign roles later
      }
    } catch (error) {
      console.error('Error creating default user role directly:', error);
      // Don't throw - user can still use the app
    }
  }

  async signUp(data: SignUpDTO): Promise<User> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (error || !authData.user) {
      throw new Error(error?.message || 'Failed to sign up');
    }

    // Create default user role after successful signup
    if (authData.user.id) {
      await this.ensureDefaultUserRole(authData.user.id);
    }

    return userMapper.toDomain(authData.user);
  }

  async signIn(data: SignInDTO): Promise<User> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      throw new Error(error?.message || 'Failed to sign in');
    }

    // Ensure user has a default role (in case they signed up before this feature)
    if (authData.user.id) {
      await this.ensureDefaultUserRole(authData.user.id);
    }

    return userMapper.toDomain(authData.user);
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Ensure user has a default role when fetching current user
    await this.ensureDefaultUserRole(user.id);

    return userMapper.toDomain(user);
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          // Ensure user has a default role when auth state changes
          await this.ensureDefaultUserRole(session.user.id);
          callback(userMapper.toDomain(session.user));
        } else {
          callback(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }
}
