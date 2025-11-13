/**
 * Product Repository Implementation
 * Supabase implementation for React Native
 */

import { IProductRepository } from '@domain/repositories/IProductRepository';
import { Product } from '@domain/entities/Product';
import { supabase } from '../client';
import * as productMapper from '../mappers/productMapper';

export class ProductRepository implements IProductRepository {
  private readonly PRODUCT_SELECT = `
    *,
    product_prices (
      *,
      sizes (*)
    ),
    product_modifier_groups (
      modifier_groups (
        *,
        modifiers (*)
      )
    )
  `;

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(this.PRODUCT_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return productMapper.toDomain(data);
  }

  async findByLocation(
    locationId: string,
    activeOnly: boolean = false
  ): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(this.PRODUCT_SELECT)
      .eq('location_id', locationId);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('name');

    if (error || !data) {
      return [];
    }

    return data.map(productMapper.toDomain);
  }

  async findByCategory(
    locationId: string,
    category: string
  ): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(this.PRODUCT_SELECT)
      .eq('location_id', locationId)
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error || !data) {
      return [];
    }

    return data.map(productMapper.toDomain);
  }

  async getCategories(locationId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('location_id', locationId)
      .eq('is_active', true);

    if (error || !data) {
      return [];
    }

    // Get unique categories
    const categories = [...new Set(data.map(p => p.category))];
    return categories.sort();
  }

  async search(locationId: string, query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(this.PRODUCT_SELECT)
      .eq('location_id', locationId)
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('name')
      .limit(20);

    if (error || !data) {
      return [];
    }

    return data.map(productMapper.toDomain);
  }
}

