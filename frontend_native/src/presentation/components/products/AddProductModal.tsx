/**
 * Add Product Modal
 * Modal form for creating new products
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductRepository } from '@infrastructure/supabase/repositories/ProductRepository';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { theme } from '@theme/index';
import { dollarsToCents } from '@shared/utils/currency';
import type { CreateProductDTO } from '@domain/repositories/IProductRepository';

const productRepository = new ProductRepository();

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductModal({
  visible,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const { currentStore } = useAppStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);

  const createMutation = useMutation({
    mutationFn: (data: CreateProductDTO) => productRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess();
      resetForm();
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to create product');
    },
  });

  const resetForm = () => {
    setName('');
    setCategory('');
    setImageUrl('');
    setPrice('');
    setIsActive(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Validation Error', 'Category is required');
      return;
    }

    if (!price.trim()) {
      Alert.alert('Validation Error', 'Price is required');
      return;
    }

    if (!currentStore) {
      Alert.alert('Error', 'Store not selected');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Validation Error', 'Invalid price');
      return;
    }

    const productData: CreateProductDTO = {
      orgId: currentStore.orgId,
      storeId: currentStore.id,
      name: name.trim(),
      category: category.trim(),
      priceCents: dollarsToCents(priceValue),
      imageUrl: imageUrl.trim() || null,
      isActive,
    };

    createMutation.mutate(productData);
  };

  const handleClose = () => {
    if (createMutation.isPending) return;
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={createMutation.isPending}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Espresso"
                value={name}
                onChangeText={setName}
                editable={!createMutation.isPending}
                placeholderTextColor={theme.colors.gray[400]}
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Coffee, Pastry, Beverage"
                value={category}
                onChangeText={setCategory}
                editable={!createMutation.isPending}
                placeholderTextColor={theme.colors.gray[400]}
              />
            </View>

            {/* Price */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                editable={!createMutation.isPending}
                placeholderTextColor={theme.colors.gray[400]}
              />
            </View>

            {/* Image URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Image URL (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
                keyboardType="url"
                editable={!createMutation.isPending}
                placeholderTextColor={theme.colors.gray[400]}
              />
            </View>

            {/* Active Status */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  disabled={createMutation.isPending}
                  trackColor={{
                    false: theme.colors.gray[300],
                    true: theme.colors.primary[300],
                  }}
                  thumbColor={isActive ? theme.colors.primary[600] : theme.colors.gray[500]}
                />
              </View>
              <Text style={styles.helperText}>
                Active products are visible to customers
              </Text>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, createMutation.isPending && styles.buttonDisabled]}
              onPress={handleClose}
              disabled={createMutation.isPending}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, createMutation.isPending && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Create Product</Text>
              )}
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
  },
  closeButton: {
    fontSize: 24,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: theme.spacing[6],
  },
  formGroup: {
    marginBottom: theme.spacing[6],
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing[2],
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    marginTop: theme.spacing[1],
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[900],
    backgroundColor: theme.colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    padding: theme.spacing[6],
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[700],
  },
  submitButton: {
    flex: 1,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
