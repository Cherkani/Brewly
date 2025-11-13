/**
 * useUserRoles Hook
 * Fetch and manage user roles from organizations and locations
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@infrastructure/supabase/client';

export interface UserRoleInfo {
  orgRole: string | null;
  locationRole: string | null;
  isSuperAdmin: boolean; // owner role in any org
  hasLocationAssignment: boolean;
}

export function useUserRoles() {
  const { user } = useAuth();

  const { data: roleInfo, isLoading, error } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async (): Promise<UserRoleInfo> => {
      if (!user) {
        return {
          orgRole: null,
          locationRole: null,
          isSuperAdmin: false,
          hasLocationAssignment: false,
        };
      }

      // Get user's organization roles
      const { data: orgMembers } = await supabase
        .from('org_members')
        .select('role')
        .eq('user_id', user.id);

      // Get user's location roles
      const { data: locationMembers } = await supabase
        .from('location_members')
        .select('role')
        .eq('user_id', user.id);

      const orgRoles = orgMembers || [];
      const locationRoles = locationMembers || [];

      // Check if user is owner (super admin) in any organization
      const isSuperAdmin = orgRoles.some((om: any) => om.role === 'owner');

      // Get the highest role (owner > admin > cashier)
      const getHighestRole = (roles: Array<{ role: string }>): string | null => {
        if (roles.length === 0) return null;
        if (roles.some((r) => r.role === 'owner')) return 'owner';
        if (roles.some((r) => r.role === 'admin')) return 'admin';
        if (roles.some((r) => r.role === 'cashier')) return 'cashier';
        return roles[0]?.role || null;
      };

      return {
        orgRole: getHighestRole(orgRoles),
        locationRole: getHighestRole(locationRoles),
        isSuperAdmin,
        hasLocationAssignment: locationRoles.length > 0,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    roleInfo: roleInfo || {
      orgRole: null,
      locationRole: null,
      isSuperAdmin: false,
      hasLocationAssignment: false,
    },
    loading: isLoading,
    error,
  };
}

