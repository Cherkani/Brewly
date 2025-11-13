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
  async signUp(data: SignUpDTO): Promise<User> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (error || !authData.user) {
      throw new Error(error?.message || 'Failed to sign up');
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

    return userMapper.toDomain(authData.user);
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

