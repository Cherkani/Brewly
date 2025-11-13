/**
 * useUserRoles Hook
 * Fetch and manage user roles from user_roles table
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@infrastructure/supabase/client';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { UserRole } from '@domain/entities/User';

interface RoleInfo {
  orgRole: UserRole | null;
  storeRole: UserRole | null;
  isSuperAdmin: boolean;
  hasStoreAssignment: boolean;
}

export function useUserRoles(): { roleInfo: RoleInfo; isLoading: boolean; error: Error | null } {
  const { user } = useAuth();
  const { currentStore } = useAppStore();

  const {
    data: roleInfo = {
      orgRole: null,
      storeRole: null,
      isSuperAdmin: false,
      hasStoreAssignment: false,
    },
    isLoading,
    error,
  } = useQuery<RoleInfo, Error>({
    queryKey: ['userRoles', user?.id, currentStore?.id],
    queryFn: async () => {
      if (!user) {
        return {
          orgRole: null,
          storeRole: null,
          isSuperAdmin: false,
          hasStoreAssignment: false,
        };
      }

      let orgRole: UserRole | null = null;
      let storeRole: UserRole | null = null;
      let isSuperAdmin = false;
      let hasStoreAssignment = false;

      // Get all user roles
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select('role, org_id, store_id')
        .eq('user_id', user.id);

      if (userRolesData) {
        // Check for superadmin
        isSuperAdmin = userRolesData.some(ur => ur.role === 'superadmin');

        // Get organization role (admin role with org_id but no store_id)
        const orgRoleData = userRolesData.find(ur => 
          ur.role === 'admin' && ur.org_id && !ur.store_id
        );
        if (orgRoleData) {
          orgRole = orgRoleData.role as UserRole;
        }

        // Get store role if a store is selected
        if (currentStore) {
          const storeRoleData = userRolesData.find(ur => 
            ur.store_id === currentStore.id
          );
          if (storeRoleData) {
            storeRole = storeRoleData.role as UserRole;
            hasStoreAssignment = true;
          }
        } else {
          // Check if user has any store assignment
          hasStoreAssignment = userRolesData.some(ur => ur.store_id !== null);
        }
      }

      return { orgRole, storeRole, isSuperAdmin, hasStoreAssignment };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { roleInfo, isLoading, error };
}
