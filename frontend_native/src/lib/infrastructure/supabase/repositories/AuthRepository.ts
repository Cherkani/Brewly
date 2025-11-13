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
   * Only used for new signups, not for existing users
   */
private async ensureDefaultUserRole(userId: string): Promise<void> {
    try {
      console.log('Ensuring default user role for user:', userId);

      // First, check if user already has roles
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role, is_default')
        .eq('user_id', userId);

      console.log('Existing roles for user:', existingRoles);

      if (existingRoles && existingRoles.length > 0) {
        const hasDefault = existingRoles.some(role => role.is_default);
        if (hasDefault) {
          console.log('User already has default role');
          return;
        }
      }

      // First, try using the database function (if it exists)
      console.log('Trying database function...');
      const { error: rpcError } = await supabase.rpc('ensure_default_user_role');

      if (!rpcError) {
        console.log('Database function succeeded');
        // Function call succeeded
        return;
      }

      console.log('Database function failed, trying direct insert:', rpcError);

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
   * Assigns to "Default" org and "Main Street Store"
   */
  private async createDefaultUserRoleDirect(userId: string): Promise<void> {
    try {
      // Get the "Default" organization
      let { data: orgs, error: orgsError } = await supabase
        .from('orgs')
        .select('id')
        .eq('name', 'Default')
        .limit(1)
        .single();

      // If "Default" org doesn't exist, fallback to first org
      if (orgsError || !orgs) {
        const { data: fallbackOrg, error: fallbackError } = await supabase
          .from('orgs')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        
        if (fallbackError || !fallbackOrg) {
          console.warn('No organizations found, skipping default role creation');
          return;
        }
        orgs = fallbackOrg;
      }

      // Get "Main Street Store" for the Default org
      let { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('org_id', orgs.id)
        .eq('name', 'Main Street Store')
        .eq('is_active', true)
        .limit(1)
        .single();

      // If "Main Street Store" doesn't exist, fallback to first active store
      if (storesError || !stores) {
        const { data: fallbackStore, error: fallbackStoreError } = await supabase
          .from('stores')
          .select('id')
          .eq('org_id', orgs.id)
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        
        if (fallbackStoreError || !fallbackStore) {
          console.warn('No active stores found, skipping default role creation');
          return;
        }
        stores = fallbackStore;
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
      console.log('Creating default cashier role for user:', userId, 'org:', orgs.id, 'store:', stores.id);
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
      } else {
        console.log('Successfully created default user role');
      }
    } catch (error) {
      console.error('Error creating default user role directly:', error);
      // Don't throw - user can still use the app
    }
  }

  async signUp(data: SignUpDTO): Promise<User> {
    console.log('Starting signup process for:', data.email, 'with role:', data.role);

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role || 'cashier', // Store role in metadata for database function
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }

    if (!authData.user) {
      console.error('No user returned from signup');
      throw new Error('Failed to sign up - no user created');
    }

    console.log('Signup successful, user created:', authData.user.id);

    // Assign default cashier role using database function (bypasses RLS)
    if (authData.user.id) {
      console.log('Assigning default role to new user...');

      try {
        console.log(`Calling database function for user ${authData.user.id}`);

        // Call the database function that bypasses RLS
        const { data: functionResult, error: functionError } = await supabase.rpc(
          'assign_default_user_role',
          { user_uuid: authData.user.id }
        );

        if (functionError) {
          console.error('❌ Database function failed:', functionError);

          // Check if function doesn't exist
          if (functionError.code === '42883') {
            console.warn('⚠️ Database function not found - run migrations to create it');
          }

          // Don't throw error - allow signup to complete
          console.warn('⚠️ User created successfully but role assignment failed. Contact admin for role assignment.');
        } else {
          console.log('✅ Role assigned successfully via database function');
          console.log('📍 Default Organization: 00000000-0000-0000-0000-000000000001');
          console.log('🏪 Main Street Store: 10000000-0000-0000-0000-000000000001');
        }

      } catch (functionCallError) {
        console.error('❌ Unexpected error calling database function:', functionCallError);
        // Don't throw - signup should still succeed even if role assignment fails
        console.warn('⚠️ Role assignment encountered an error, but signup completed successfully.');
      }
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

    // NOTE: No automatic role assignment for existing users on signin
    // Roles must be assigned manually by admins

    return userMapper.toDomain(authData.user);
  }

  /**
   * Manually assign a role to a user (admin function)
   */
  async assignUserRole(userId: string, role: 'superadmin' | 'admin' | 'developer' | 'cashier', orgId?: string, storeId?: string): Promise<void> {
    console.log(`Assigning role ${role} to user ${userId}`);

    // If no org/store specified, use default ones
    let finalOrgId = orgId;
    let finalStoreId = storeId;

    if (!finalOrgId || !finalStoreId) {
      // Get default org and store
      const { data: orgs } = await supabase
        .from('orgs')
        .select('id')
        .eq('name', 'Default')
        .single();

      if (orgs) {
        finalOrgId = orgs.id;

        const { data: stores } = await supabase
          .from('stores')
          .select('id')
          .eq('org_id', orgs.id)
          .eq('name', 'Main Street Store')
          .eq('is_active', true)
          .single();

        if (stores) {
          finalStoreId = stores.id;
        }
      }
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        org_id: finalOrgId || null,
        store_id: finalStoreId || null,
        is_default: true,
      });

    if (error) {
      console.error('Failed to assign user role:', error);
      throw new Error(`Failed to assign role: ${error.message}`);
    }

    console.log(`Successfully assigned role ${role} to user ${userId}`);
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

    // NOTE: No automatic role assignment for existing users
    // Roles must be assigned manually by admins

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
          // NOTE: No automatic role assignment for existing users
          // Roles must be assigned manually by admins
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
