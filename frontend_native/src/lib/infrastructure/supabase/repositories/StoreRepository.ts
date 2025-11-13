/**
 * Store Repository Implementation
 * Supabase implementation for React Native
 */

import { IStoreRepository } from '@domain/repositories/IStoreRepository';
import { Store } from '@domain/entities/Store';
import { supabase } from '../client';
import * as storeMapper from '../mappers/storeMapper';

export class StoreRepository implements IStoreRepository {
  async findById(id: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return storeMapper.toDomain(data);
  }

  async findByOrg(orgId: string): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name');

    if (error || !data) {
      return [];
    }

    return data.map(storeMapper.toDomain);
  }

  async findByUser(userId: string): Promise<Store[]> {
    // Check if user is developer or superadmin - they can see all stores
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const isDeveloper = userRoles?.some(ur => ur.role === 'developer');
    const isSuperAdmin = userRoles?.some(ur => ur.role === 'superadmin');

    // If developer or superadmin, return all active stores
    if (isDeveloper || isSuperAdmin) {
      const { data: allStores, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching all stores for developer/superadmin:', error);
        return [];
      }

      if (!allStores) {
        return [];
      }

      // Get default store to prioritize it
      const defaultStore = await this.findDefaultByUser(userId);
      if (defaultStore) {
        const otherStores = allStores
          .filter(s => s.id !== defaultStore.id)
          .map(storeMapper.toDomain);
        return [defaultStore, ...otherStores];
      }

      return allStores.map(storeMapper.toDomain);
    }

    // For regular users, get stores from user_roles
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        store_id,
        is_default,
        stores (*)
      `)
      .eq('user_id', userId)
      .not('store_id', 'is', null)
      .order('is_default', { ascending: false }); // Default role first

    if (error) {
      console.error('Error fetching user stores:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Extract unique stores, prioritizing default store
    const storeMap = new Map<string, any>();
    data.forEach(ur => {
      if (ur.stores && ur.store_id) {
        // If this is the default role's store, ensure it's first
        if (ur.is_default) {
          const existing = storeMap.get(ur.store_id);
          if (!existing) {
            storeMap.set(ur.store_id, ur.stores);
          }
        } else {
          // Only add if not already added (default takes precedence)
          if (!storeMap.has(ur.store_id)) {
            storeMap.set(ur.store_id, ur.stores);
          }
        }
      }
    });

    return Array.from(storeMap.values())
      .filter(Boolean)
      .map(storeMapper.toDomain);
  }

  /**
   * Get the default store for a user (from their default role)
   */
  async findDefaultByUser(userId: string): Promise<Store | null> {
    // Get the default role's store
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        store_id,
        stores (*)
      `)
      .eq('user_id', userId)
      .eq('is_default', true)
      .not('store_id', 'is', null)
      .limit(1)
      .single();

    if (error || !data || !data.stores) {
      // For developers/superadmins without a default store, return first store
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const isDeveloper = userRoles?.some(ur => ur.role === 'developer');
      const isSuperAdmin = userRoles?.some(ur => ur.role === 'superadmin');

      if (isDeveloper || isSuperAdmin) {
        // Return first active store as default
        const { data: firstStore } = await supabase
          .from('stores')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (firstStore) {
          return storeMapper.toDomain(firstStore);
        }
      }

      return null;
    }

    return storeMapper.toDomain(data.stores);
  }

  /**
   * Get all organizations (for developers/superadmins)
   */
  async findAllOrgs(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .from('orgs')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching all organizations:', error);
      return [];
    }

    return data || [];
  }
}

