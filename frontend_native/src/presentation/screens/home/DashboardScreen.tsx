/**
 * Dashboard Screen
 * Main dashboard with stats and quick actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@application/hooks/useAuth';
import { useStore } from '@application/hooks/useStore';
import { useOrderStats } from '@application/hooks/useOrders';
import { theme } from '@theme/index';
import { formatCents } from '@shared/utils/currency';
import type { HomeStackScreenProps } from '@navigation/types';

export function DashboardScreen({ navigation }: HomeStackScreenProps<'Dashboard'>) {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const { stats, loading } = useOrderStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  if (!currentStore) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No location selected</Text>
        <Text style={styles.emptySubtext}>Please select a location to continue</Text>
      </View>
    );
  }

  const totalActiveOrders = stats.queued + stats.in_progress + stats.ready;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.getDisplayName()}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.getInitials()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.locationCard}>
        <Text style={styles.locationLabel}>Current Store</Text>
        <Text style={styles.locationName}>{currentStore.name}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalActiveOrders}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
          <Text style={styles.statDetail}>
            {stats.queued} queued · {stats.in_progress} in progress
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
          <Text style={styles.statDetail}>{stats.paid} paid</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionLabel}>New Order</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>☕</Text>
          <Text style={styles.actionLabel}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionLabel}>Reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing[2],
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.white,
  },
  greeting: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[600],
  },
  userName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  locationCard: {
    margin: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.base,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[600],
  },
  locationLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[700],
    marginBottom: theme.spacing[1],
  },
  locationName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[900],
  },
  statsGrid: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  statCard: {
    flex: 1,
    padding: theme.spacing[4],
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.base,
    ...theme.shadow.base,
  },
  statValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing[1],
  },
  statDetail: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray[500],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    paddingHorizontal: theme.spacing[4],
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  actionCard: {
    width: '47%',
    aspectRatio: 1.5,
    padding: theme.spacing[4],
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.base,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing[2],
  },
  actionLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
  },
});

