/**
 * Product Repository Implementation
 * Supabase implementation for React Native
 */

import {
  IProductRepository,
  CreateProductDTO,
  UpdateProductDTO,
} from '@domain/repositories/IProductRepository';
import { Product } from '@domain/entities/Product';
import { supabase } from '../client';
import * as productMapper from '../mappers/productMapper';

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return productMapper.toDomain(data);
  }

  async findByStore(
    storeId: string,
    activeOnly: boolean = false
  ): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId);

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
    storeId: string,
    category: string
  ): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error || !data) {
      return [];
    }

    return data.map(productMapper.toDomain);
  }

  async getCategories(storeId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (error || !data) {
      return [];
    }

    // Get unique categories, filter out nulls
    const categories = [...new Set(data.map(p => p.category).filter(Boolean))];
    return categories.sort();
  }

  async search(storeId: string, query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('name')
      .limit(20);

    if (error || !data) {
      return [];
    }

    return data.map(productMapper.toDomain);
  }

  async create(dto: CreateProductDTO): Promise<Product> {
    const productData = productMapper.createDTOToPersistence(dto);
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError || !product) {
      throw new Error(`Failed to create product: ${productError?.message}`);
    }

    return productMapper.toDomain(product);
  }

  async update(id: string, dto: UpdateProductDTO): Promise<Product> {
    const updateData = productMapper.updateDTOToPersistence(dto);

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    const updatedProduct = await this.findById(id);
    if (!updatedProduct) {
      throw new Error('Failed to fetch updated product');
    }

    return updatedProduct;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
}
