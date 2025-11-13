/**
 * User Mapper
 * Maps between Supabase auth user and domain entity
 */

import { User } from '@domain/entities/User';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function toDomain(authUser: SupabaseUser): User {
  return new User(
    authUser.id,
    authUser.email!,
    {
      full_name: authUser.user_metadata?.full_name,
      avatar_url: authUser.user_metadata?.avatar_url,
    },
    new Date(authUser.created_at)
  );
}

