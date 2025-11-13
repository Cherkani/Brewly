/**
 * Custom Drawer Content
 * Custom sidebar drawer content with navigation items
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '@application/hooks/useAuth';
import { useLocation } from '@application/hooks/useLocation';
import { useUserRoles } from '@application/hooks/useUserRoles';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { theme } from '@theme/index';
import { DeveloperModeSwitcher } from '@components/dev/DeveloperModeSwitcher';

type DrawerItem = {
  label: string;
  icon: string;
  route: keyof import('./types').MainTabParamList;
};

const drawerItems: DrawerItem[] = [
  { label: 'Dashboard', icon: '🏠', route: 'Home' },
  { label: 'POS', icon: '🛒', route: 'POS' },
  { label: 'Orders', icon: '📋', route: 'Orders' },
  { label: 'Menu', icon: '☕', route: 'Menu' },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const { currentLocation } = useLocation();
  const { roleInfo } = useUserRoles();
  const { developerMode, setDeveloperMode } = useAppStore();
  const [showDeveloperSwitcher, setShowDeveloperSwitcher] = useState(false);
  const activeRoute = props.state.routes[props.state.index].name;

  const handleNavigate = (route: string) => {
    props.navigation.navigate(route as any);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>☕</Text>
            <Text style={styles.logoText}>Brewly</Text>
          </View>
          {user && (
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.getInitials()}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.getDisplayName()}
                </Text>
                {/* Role Display */}
                {roleInfo.locationRole && (
                  <Text style={styles.roleText} numberOfLines={1}>
                    {roleInfo.locationRole.charAt(0).toUpperCase() + roleInfo.locationRole.slice(1)}
                    {currentLocation && ` • ${currentLocation.name}`}
                  </Text>
                )}
                {!roleInfo.hasLocationAssignment && roleInfo.orgRole && (
                  <Text style={styles.roleText} numberOfLines={1}>
                    {roleInfo.orgRole.charAt(0).toUpperCase() + roleInfo.orgRole.slice(1)} • Not assigned to any store
                  </Text>
                )}
                {!roleInfo.hasLocationAssignment && !roleInfo.orgRole && (
                  <Text style={styles.roleText} numberOfLines={1}>
                    Not assigned to any organization
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Navigation Items */}
        <View style={styles.menuSection}>
          {drawerItems.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleNavigate(item.route)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.menuLabel,
                    isActive && styles.menuLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Developer Mode Section (Super Admin Only) */}
        {roleInfo.isSuperAdmin && (
          <View style={styles.developerSection}>
            <View style={styles.developerHeader}>
              <Text style={styles.developerTitle}>Developer Mode</Text>
              <Switch
                value={developerMode}
                onValueChange={setDeveloperMode}
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.warning.main,
                }}
                thumbColor={developerMode ? theme.colors.warning.dark : theme.colors.gray[500]}
              />
            </View>
            <Text style={styles.developerDescription}>
              Bypass RLS policies and switch between organizations/locations
            </Text>
            {developerMode && (
              <TouchableOpacity
                style={styles.developerButton}
                onPress={() => setShowDeveloperSwitcher(true)}
              >
                <Text style={styles.developerButtonText}>Switch Org/Location</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Developer Mode Switcher Modal */}
      {showDeveloperSwitcher && (
        <DeveloperModeSwitcher
          visible={showDeveloperSwitcher}
          onClose={() => setShowDeveloperSwitcher(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: theme.spacing[6],
    paddingTop: theme.spacing[8],
    backgroundColor: theme.colors.primary[600],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary[700],
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  logo: {
    fontSize: 32,
    marginRight: theme.spacing[3],
  },
  logoText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  avatarText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
    marginBottom: theme.spacing[1],
  },
  locationName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[100],
  },
  roleText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[100],
    marginTop: theme.spacing[1],
  },
  developerSection: {
    margin: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: '#FEF3C7', // warning-100 equivalent
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.warning.light,
  },
  developerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  developerTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.warning.dark,
  },
  developerDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning.dark,
    marginBottom: theme.spacing[3],
  },
  developerButton: {
    padding: theme.spacing[3],
    backgroundColor: theme.colors.warning.main,
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
  },
  developerButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  menuSection: {
    paddingVertical: theme.spacing[2],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    marginHorizontal: theme.spacing[2],
    marginVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: theme.colors.primary[50],
  },
  menuIcon: {
    fontSize: 24,
    marginRight: theme.spacing[4],
    width: 28,
  },
  menuLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    flex: 1,
  },
  menuLabelActive: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 4,
    height: 24,
    backgroundColor: theme.colors.primary[600],
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  footer: {
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.gray[50],
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.white,
  },
  signOutIcon: {
    fontSize: 20,
    marginRight: theme.spacing[3],
  },
  signOutText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.error.main,
  },
});

