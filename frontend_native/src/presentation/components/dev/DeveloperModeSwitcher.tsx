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
import { Location } from '@domain/entities/Location';

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
  const { currentLocation, setCurrentLocation } = useAppStore();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
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
      // Load all organizations (bypassing RLS in developer mode)
      const { data: orgsData } = await supabase
        .from('orgs')
        .select('id, name')
        .order('name');

      // Load all locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (orgsData) setOrgs(orgsData);
      if (locationsData) {
        const locations = locationsData.map((loc: any) => new Location(
          loc.id,
          loc.org_id,
          loc.name,
          loc.address,
          loc.timezone,
          loc.is_active,
          new Date(loc.created_at)
        ));
        setAllLocations(locations);
      }

      // Set selected org based on current location
      if (currentLocation) {
        setSelectedOrgId(currentLocation.orgId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load organizations and locations');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = selectedOrgId
    ? allLocations.filter((loc) => loc.orgId === selectedOrgId)
    : [];

  const handleOrgSelect = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  const handleLocationSelect = (location: Location) => {
    setCurrentLocation(location);
    Alert.alert('Success', `Switched to ${location.name}`);
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
            <Text style={styles.modalSubtitle}>Switch Organization & Location</Text>
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

              {/* Locations */}
              {selectedOrgId && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Location</Text>
                  {filteredLocations.length === 0 ? (
                    <Text style={styles.emptyText}>No locations found for this organization</Text>
                  ) : (
                    filteredLocations.map((location) => (
                      <TouchableOpacity
                        key={location.id}
                        style={[
                          styles.optionCard,
                          currentLocation?.id === location.id && styles.optionCardActive,
                        ]}
                        onPress={() => handleLocationSelect(location)}
                      >
                        <View style={styles.locationInfo}>
                          <Text
                            style={[
                              styles.optionText,
                              currentLocation?.id === location.id && styles.optionTextActive,
                            ]}
                          >
                            {location.name}
                          </Text>
                          {location.address && (
                            <Text style={styles.locationAddress}>{location.address}</Text>
                          )}
                        </View>
                        {currentLocation?.id === location.id && (
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
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
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

