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
import { useLocation } from '@application/hooks/useLocation';
import { useSizes } from '@application/hooks/useProducts';
import { theme } from '@theme/index';
import { dollarsToCents } from '@shared/utils/currency';
import type { CreateProductDTO } from '@domain/repositories/IProductRepository';

const productRepository = new ProductRepository();

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductPrice {
  sizeId: string;
  sizeName: string;
  price: string; // User input as string
}

export function AddProductModal({
  visible,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const { currentLocation } = useLocation();
  const { sizes } = useSizes();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [prices, setPrices] = useState<ProductPrice[]>([]);

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
    setImage('');
    setIsActive(true);
    setPrices([]);
  };

  const handleAddSize = () => {
    if (sizes.length === 0) {
      Alert.alert('No Sizes', 'Please create sizes first in your organization settings.');
      return;
    }
    // Add first available size that's not already added
    const availableSize = sizes.find(
      s => !prices.some(p => p.sizeId === s.id)
    );
    if (availableSize) {
      setPrices([...prices, { sizeId: availableSize.id, sizeName: availableSize.name, price: '' }]);
    } else {
      Alert.alert('All Sizes Added', 'All available sizes have been added.');
    }
  };

  const handleRemoveSize = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index: number, value: string) => {
    const newPrices = [...prices];
    newPrices[index].price = value;
    setPrices(newPrices);
  };

  const handleSizeChange = (index: number, sizeId: string) => {
    const selectedSize = sizes.find(s => s.id === sizeId);
    if (selectedSize) {
      const newPrices = [...prices];
      newPrices[index] = {
        ...newPrices[index],
        sizeId: selectedSize.id,
        sizeName: selectedSize.name,
      };
      setPrices(newPrices);
    }
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

    if (!currentLocation) {
      Alert.alert('Error', 'Location not selected');
      return;
    }

    // Validate prices
    const validPrices = prices
      .filter(p => p.sizeId && p.price.trim())
      .map(p => {
        const priceValue = parseFloat(p.price);
        if (isNaN(priceValue) || priceValue < 0) {
          throw new Error(`Invalid price for ${p.sizeName}`);
        }
        return {
          sizeId: p.sizeId,
          priceInCents: dollarsToCents(priceValue),
        };
      });

    if (validPrices.length === 0) {
      Alert.alert('Validation Error', 'At least one price is required');
      return;
    }

    const productData: CreateProductDTO = {
      orgId: currentLocation.orgId,
      locationId: currentLocation.id,
      name: name.trim(),
      category: category.trim(),
      image: image.trim() || null,
      isActive,
      prices: validPrices,
    };

    createMutation.mutate(productData);
  };

  const handleClose = () => {
    if (createMutation.isPending) return;
    resetForm();
    onClose();
  };

  const availableSizesForSelection = sizes.filter(
    s => !prices.some(p => p.sizeId === s.id)
  );

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

            {/* Image URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Image URL (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                value={image}
                onChangeText={setImage}
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

            {/* Prices */}
            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Prices *</Text>
                <TouchableOpacity
                  style={styles.addSizeButton}
                  onPress={handleAddSize}
                  disabled={createMutation.isPending || availableSizesForSelection.length === 0}
                >
                  <Text style={styles.addSizeButtonText}>+ Add Size</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                Add at least one size with price
              </Text>

              {prices.map((price, index) => (
                <View key={index} style={styles.priceRow}>
                  <View style={styles.priceRowContent}>
                    <View style={styles.sizeSelector}>
                      <Text style={styles.priceLabel}>Size:</Text>
                      <View style={styles.sizeButtons}>
                        {sizes.map((size) => (
                          <TouchableOpacity
                            key={size.id}
                            style={[
                              styles.sizeButton,
                              price.sizeId === size.id && styles.sizeButtonActive,
                            ]}
                            onPress={() => handleSizeChange(index, size.id)}
                            disabled={createMutation.isPending}
                          >
                            <Text
                              style={[
                                styles.sizeButtonText,
                                price.sizeId === size.id && styles.sizeButtonTextActive,
                              ]}
                            >
                              {size.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.priceLabel}>Price ($):</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="0.00"
                        value={price.price}
                        onChangeText={(value) => handlePriceChange(index, value)}
                        keyboardType="decimal-pad"
                        editable={!createMutation.isPending}
                        placeholderTextColor={theme.colors.gray[400]}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveSize(index)}
                      disabled={createMutation.isPending}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {prices.length === 0 && (
                <View style={styles.emptyPrices}>
                  <Text style={styles.emptyPricesText}>
                    No prices added yet. Tap "+ Add Size" to add a price.
                  </Text>
                </View>
              )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  addSizeButton: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.base,
  },
  addSizeButtonText: {
    color: theme.colors.primary[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  priceRow: {
    marginTop: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  priceRowContent: {
    gap: theme.spacing[3],
  },
  sizeSelector: {
    marginBottom: theme.spacing[2],
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  sizeButton: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.white,
  },
  sizeButtonActive: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  sizeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  sizeButtonTextActive: {
    color: theme.colors.white,
  },
  priceInputContainer: {
    marginTop: theme.spacing[2],
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing[2],
  },
  priceInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[900],
    backgroundColor: theme.colors.white,
  },
  removeButton: {
    marginTop: theme.spacing[2],
    paddingVertical: theme.spacing[2],
    alignItems: 'center',
  },
  removeButtonText: {
    color: theme.colors.error.main,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyPrices: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderStyle: 'dashed',
  },
  emptyPricesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    textAlign: 'center',
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

