/**
 * useAuth Hook
 * Authentication operations and state
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { AuthRepository } from '@infrastructure/supabase/repositories/AuthRepository';
import type { SignUpDTO, SignInDTO } from '@domain/repositories/IAuthRepository';

const authRepository = new AuthRepository();

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, setUser, setLoading } = useAppStore();

  // Get current user
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authRepository.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: (data: SignUpDTO) => authRepository.signUp(data),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'user'], user);
    },
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: (data: SignInDTO) => authRepository.signIn(data),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'user'], user);
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: () => authRepository.signOut(),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => authRepository.resetPassword(email),
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (newPassword: string) => authRepository.updatePassword(newPassword),
  });

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authRepository.onAuthStateChange((user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'user'], user);
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, queryClient]);

  // Update app store when current user changes
  useEffect(() => {
    if (currentUser !== undefined) {
      setUser(currentUser);
      setLoading(false);
    }
  }, [currentUser, setUser, setLoading]);

  return {
    user: currentUser || user,
    isLoading,
    isAuthenticated: !!currentUser,
    signUp: signUpMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    signUpError: signUpMutation.error,
    signInError: signInMutation.error,
  };
}

