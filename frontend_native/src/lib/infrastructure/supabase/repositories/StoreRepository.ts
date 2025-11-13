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
    // Get stores from user_roles where user has access
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        store_id,
        stores (*)
      `)
      .eq('user_id', userId)
      .not('store_id', 'is', null);

    if (error || !data) {
      return [];
    }

    // Extract unique stores
    const storeMap = new Map<string, any>();
    data.forEach(ur => {
      if (ur.stores && ur.store_id) {
        storeMap.set(ur.store_id, ur.stores);
      }
    });

    return Array.from(storeMap.values())
      .filter(Boolean)
      .map(storeMapper.toDomain);
  }
}

