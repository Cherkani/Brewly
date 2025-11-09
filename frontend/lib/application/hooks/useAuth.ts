/**
 * useAuth Hook
 * React hook for authentication operations
 */

'use client'

import { useState, useEffect } from 'react'
import { AuthService, SignUpData, SignInData } from '../services/AuthService'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'
import { supabase } from '@/lib/infrastructure/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const { setUser: setStoreUser, reset } = useAppStore()
  const authService = new AuthService()

  useEffect(() => {
    // Check active session
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setStoreUser({
            id: session.user.id,
            email: session.user.email || '',
            role: 'owner', // Will be determined by permissions
          })
        } else {
          setUser(null)
          setStoreUser(null)
          reset()
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      if (currentUser) {
        setStoreUser({
          id: currentUser.id,
          email: currentUser.email || '',
          role: 'owner',
        })
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: SignUpData) => {
    setLoading(true)
    try {
      await authService.signUp(data)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (data: SignInData) => {
    setLoading(true)
    try {
      await authService.signIn(data)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    try {
      await authService.resetPassword(email)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}

