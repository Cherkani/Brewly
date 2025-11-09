/**
 * Database Types
 * Generated from Supabase schema
 * 
 * Note: In a real project, these would be auto-generated using:
 * supabase gen types typescript --local > lib/shared/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          org_id: string
          location_id: string
          name: string
          category: string
          image: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          location_id: string
          name: string
          category: string
          image?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          location_id?: string
          name?: string
          category?: string
          image?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          org_id: string
          location_id: string
          number: number
          status: 'queued' | 'in_progress' | 'ready' | 'paid' | 'completed' | 'cancelled'
          cashier_id: string | null
          discount_cents: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          location_id: string
          number?: number
          status?: 'queued' | 'in_progress' | 'ready' | 'paid' | 'completed' | 'cancelled'
          cashier_id?: string | null
          discount_cents?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          location_id?: string
          number?: number
          status?: 'queued' | 'in_progress' | 'ready' | 'paid' | 'completed' | 'cancelled'
          cashier_id?: string | null
          discount_cents?: number
          notes?: string | null
          created_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

