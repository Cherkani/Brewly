/**
 * Developer Mode Switcher
 * Modal for super admins to switch organizations and locations in developer mode
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { supabase } from '@infrastructure/supabase/client';
import { theme } from '@theme/index';
import { Store } from '@domain/entities/Store';

interface Org {
  id: string;
  name: string;
}

interface DeveloperModeSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

export function DeveloperModeSwitcher({
  visible,
  onClose,
}: DeveloperModeSwitcherProps) {
  const { currentStore, setCurrentStore } = useAppStore();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all organizations (RLS allows developers/superadmins to see all)
      const { data: orgsData, error: orgsError } = await supabase
        .from('orgs')
        .select('id, name')
        .order('name');

      if (orgsError) {
        console.error('Error loading orgs:', orgsError);
        Alert.alert('Error', `Failed to load organizations: ${orgsError.message}`);
        setLoading(false);
        return;
      }

      if (orgsData) {
        setOrgs(orgsData);
      }

      // Load all stores (RLS allows developers/superadmins to see all)
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (storesError) {
        console.error('Error loading stores:', storesError);
        Alert.alert('Error', `Failed to load stores: ${storesError.message}`);
        setLoading(false);
        return;
      }

      if (storesData) {
        const stores = storesData.map((store: any) => new Store(
          store.id,
          store.org_id,
          store.name,
          store.address,
          store.is_active,
          new Date(store.created_at)
        ));
        setAllStores(stores);
      }

      // Set selected org based on current store, or select first org if none
      if (currentStore) {
        setSelectedOrgId(currentStore.orgId);
      } else if (orgsData && orgsData.length > 0) {
        setSelectedOrgId(orgsData[0].id);
      }
    } catch (error: any) {
      console.error('Error in loadData:', error);
      Alert.alert('Error', `Failed to load data: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = selectedOrgId
    ? allStores.filter((store) => store.orgId === selectedOrgId)
    : [];

  const handleOrgSelect = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  const handleStoreSelect = (store: Store) => {
    setCurrentStore(store);
    Alert.alert('Success', `Switched to ${store.name}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Developer Mode</Text>
            <Text style={styles.modalSubtitle}>Switch Organization & Store</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
          ) : (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Organizations */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Organization</Text>
                {orgs.map((org) => (
                  <TouchableOpacity
                    key={org.id}
                    style={[
                      styles.optionCard,
                      selectedOrgId === org.id && styles.optionCardActive,
                    ]}
                    onPress={() => handleOrgSelect(org.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOrgId === org.id && styles.optionTextActive,
                      ]}
                    >
                      {org.name}
                    </Text>
                    {selectedOrgId === org.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Stores */}
              {selectedOrgId && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Store</Text>
                  {filteredStores.length === 0 ? (
                    <Text style={styles.emptyText}>No stores found for this organization</Text>
                  ) : (
                    filteredStores.map((store) => (
                      <TouchableOpacity
                        key={store.id}
                        style={[
                          styles.optionCard,
                          currentStore?.id === store.id && styles.optionCardActive,
                        ]}
                        onPress={() => handleStoreSelect(store)}
                      >
                        <View style={styles.storeInfo}>
                          <Text
                            style={[
                              styles.optionText,
                              currentStore?.id === store.id && styles.optionTextActive,
                            ]}
                          >
                            {store.name}
                          </Text>
                          {store.address && (
                            <Text style={styles.storeAddress}>{store.address}</Text>
                          )}
                        </View>
                        {currentStore?.id === store.id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    position: 'relative',
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing[1],
  },
  modalSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing[6],
    right: theme.spacing[6],
    padding: theme.spacing[2],
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  loadingContainer: {
    padding: theme.spacing[8],
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
  },
  section: {
    padding: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing[4],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[2],
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  optionCardActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[600],
  },
  optionText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[900],
  },
  optionTextActive: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  storeInfo: {
    flex: 1,
  },
  storeAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing[1],
  },
  checkmark: {
    fontSize: 20,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing[4],
  },
});

