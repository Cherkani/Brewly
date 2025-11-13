/**
 * Location Repository Implementation
 * Supabase implementation for React Native
 */

import { ILocationRepository } from '@domain/repositories/ILocationRepository';
import { Location } from '@domain/entities/Location';
import { supabase } from '../client';
import * as locationMapper from '../mappers/locationMapper';

export class LocationRepository implements ILocationRepository {
  async findById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return locationMapper.toDomain(data);
  }

  async findByOrg(orgId: string): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name');

    if (error || !data) {
      return [];
    }

    return data.map(locationMapper.toDomain);
  }

  async findByUser(userId: string): Promise<Location[]> {
    const { data, error } = await supabase
      .from('location_members')
      .select(`
        locations (*)
      `)
      .eq('user_id', userId);

    if (error || !data) {
      return [];
    }

    return data
      .map(lm => lm.locations)
      .filter(Boolean)
      .map(locationMapper.toDomain);
  }
}

