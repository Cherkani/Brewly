/**
 * Supplier Repository Implementation
 * Supabase implementation of ISupplierRepository
 */

import {
  ISupplierRepository,
  CreateSupplierDTO,
  UpdateSupplierDTO,
} from '@/lib/domain/repositories/ISupplierRepository'
import { Supplier } from '@/lib/domain/entities/Supplier'
import { supabase } from '../client'
import * as supplierMapper from '../mappers/supplierMapper'

export class SupplierRepository implements ISupplierRepository {
  async findById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return supplierMapper.toDomain(data)
  }

  async findByOrg(orgId: string, activeOnly: boolean = false): Promise<Supplier[]> {
    let query = supabase
      .from('suppliers')
      .select('*')
      .eq('org_id', orgId)

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('name')

    if (error || !data) {
      return []
    }

    return data.map(supplierMapper.toDomain)
  }

  async findByCategory(orgId: string, category: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('org_id', orgId)
      .eq('category', category)
      .eq('is_active', true)
      .order('name')

    if (error || !data) {
      return []
    }

    return data.map(supplierMapper.toDomain)
  }

  async getCategories(orgId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('category')
      .eq('org_id', orgId)
      .not('category', 'is', null)

    if (error || !data) {
      return []
    }

    const categories = [...new Set(data.map(s => s.category).filter(Boolean))]
    return categories.sort() as string[]
  }

  async create(dto: CreateSupplierDTO): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        org_id: dto.orgId,
        name: dto.name,
        contact_email: dto.contactEmail,
        contact_phone: dto.contactPhone,
        address: dto.address,
        category: dto.category,
        rating: dto.rating,
        is_active: dto.isActive !== undefined ? dto.isActive : true,
        payment_terms: dto.paymentTerms,
        delivery_time: dto.deliveryTime,
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to create supplier: ${error?.message}`)
    }

    return supplierMapper.toDomain(data)
  }

  async update(id: string, dto: UpdateSupplierDTO): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update({
        name: dto.name,
        contact_email: dto.contactEmail,
        contact_phone: dto.contactPhone,
        address: dto.address,
        category: dto.category,
        rating: dto.rating,
        is_active: dto.isActive,
        payment_terms: dto.paymentTerms,
        delivery_time: dto.deliveryTime,
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update supplier: ${error?.message}`)
    }

    return supplierMapper.toDomain(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete supplier: ${error.message}`)
    }
  }

  async search(orgId: string, query: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('org_id', orgId)
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('name')
      .limit(20)

    if (error || !data) {
      return []
    }

    return data.map(supplierMapper.toDomain)
  }

  async getTopRated(orgId: string, limit: number = 5): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .not('rating', 'is', null)
      .order('rating', { ascending: false })
      .limit(limit)

    if (error || !data) {
      return []
    }

    return data.map(supplierMapper.toDomain)
  }
}

