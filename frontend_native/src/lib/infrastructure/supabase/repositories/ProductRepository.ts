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

  async create(dto: CreateProductDTO): Promise<Product> {
    // Insert product
    const productData = productMapper.createDTOToPersistence(dto);
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError || !product) {
      throw new Error(`Failed to create product: ${productError?.message}`);
    }

    // Insert prices if provided
    if (dto.prices && dto.prices.length > 0) {
      const priceData = dto.prices.map(p => ({
        org_id: dto.orgId,
        location_id: dto.locationId,
        product_id: product.id,
        size_id: p.sizeId,
        price_cents: p.priceInCents,
      }));

      const { error: priceError } = await supabase
        .from('product_prices')
        .insert(priceData);

      if (priceError) {
        // Rollback: delete the product
        await supabase.from('products').delete().eq('id', product.id);
        throw new Error(`Failed to create product prices: ${priceError.message}`);
      }
    }

    // Associate modifier groups if provided
    if (dto.modifierGroupIds && dto.modifierGroupIds.length > 0) {
      const modifierGroupData = dto.modifierGroupIds.map((groupId, index) => ({
        org_id: dto.orgId,
        location_id: dto.locationId,
        product_id: product.id,
        group_id: groupId,
        sort_order: index,
      }));

      const { error: mgError } = await supabase
        .from('product_modifier_groups')
        .insert(modifierGroupData);

      if (mgError) {
        // Rollback: delete the product
        await supabase.from('products').delete().eq('id', product.id);
        throw new Error(
          `Failed to associate modifier groups: ${mgError.message}`
        );
      }
    }

    // Fetch and return complete product
    const createdProduct = await this.findById(product.id);
    if (!createdProduct) {
      throw new Error('Failed to fetch created product');
    }

    return createdProduct;
  }

  async update(id: string, dto: UpdateProductDTO): Promise<Product> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

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

