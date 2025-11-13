/**
 * Menu Screen
 * Product catalog management - view, search, filter, and add products
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useProducts, useCategories } from '@application/hooks/useProducts';
import { useLocation } from '@application/hooks/useLocation';
import { useAppStore } from '@infrastructure/state/stores/appStore';
import { theme } from '@theme/index';
import { formatCents } from '@shared/utils/currency';
import { Product } from '@domain/entities/Product';
import { AddProductModal } from '@components/menu/AddProductModal';
import type { MenuStackScreenProps } from '@navigation/types';

export function MenuScreen({ navigation }: MenuStackScreenProps<'MenuList'>) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentLocation } = useLocation();
  const { products, loading: productsLoading, refetch } = useProducts(false); // Show all products
  const { categories, loading: categoriesLoading } = useCategories();

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeProducts = products.filter(p => p.isActive).length;
  const inactiveProducts = products.filter(p => !p.isActive).length;

  if (!currentLocation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No location selected</Text>
        <Text style={styles.emptySubtext}>Please select a location to manage menu</Text>
      </View>
    );
  }

  const handleProductPress = (product: Product) => {
    // TODO: Navigate to product detail/edit screen
    Alert.alert(
      product.name,
      `Category: ${product.category}\nStatus: ${product.isActive ? 'Active' : 'Inactive'}\n\nEdit functionality coming soon.`,
      [{ text: 'OK' }]
    );
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    refetch();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Menu Management</Text>
          <Text style={styles.subtitle}>{currentLocation.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.statValueActive]}>
            {activeProducts}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.statValueInactive]}>
            {inactiveProducts}
          </Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.gray[400]}
        />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === null && styles.categoryChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categoriesLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary[600]} />
        ) : (
          categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Products List */}
      {productsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>☕</Text>
          <Text style={styles.emptyText}>
            {searchQuery || selectedCategory
              ? 'No products match your filters'
              : 'No products yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {!searchQuery && !selectedCategory
              ? 'Tap "+ Add" to create your first product'
              : 'Try adjusting your search or filters'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item)}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.resultsText}>
              Showing {filteredProducts.length} of {products.length} products
            </Text>
          }
        />
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </View>
  );
}

function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  const minPrice = product.prices.length > 0
    ? Math.min(...product.prices.map(p => p.priceInCents))
    : 0;
  const maxPrice = product.prices.length > 0
    ? Math.max(...product.prices.map(p => p.priceInCents))
    : 0;

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <View style={styles.productCardContent}>
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name}</Text>
            {!product.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactive</Text>
              </View>
            )}
          </View>
          <Text style={styles.productCategory}>{product.category}</Text>
          {product.prices.length > 0 && (
            <Text style={styles.productPrice}>
              {minPrice === maxPrice
                ? formatCents(minPrice)
                : `${formatCents(minPrice)} - ${formatCents(maxPrice)}`}
            </Text>
          )}
          {product.prices.length === 0 && (
            <Text style={styles.productPriceWarning}>No prices set</Text>
          )}
        </View>
        <View style={styles.productStats}>
          <Text style={styles.productStatText}>
            {product.prices.length} size{product.prices.length !== 1 ? 's' : ''}
          </Text>
          {product.modifierGroups.length > 0 && (
            <Text style={styles.productStatText}>
              {product.modifierGroups.length} modifier{product.modifierGroups.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing[1],
  },
  addButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    ...theme.shadow.base,
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing[1],
  },
  statValueActive: {
    color: theme.colors.success.main,
  },
  statValueInactive: {
    color: theme.colors.gray[500],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
  },
  searchContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  searchInput: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[900],
  },
  categoryContainer: {
    marginBottom: theme.spacing[3],
  },
  categoryContent: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  categoryChip: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  categoryChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  categoryChipTextActive: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  productsList: {
    padding: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  resultsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing[3],
  },
  productCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing[3],
    ...theme.shadow.base,
  },
  productCardContent: {
    padding: theme.spacing[4],
  },
  productInfo: {
    marginBottom: theme.spacing[2],
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[1],
  },
  productName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    flex: 1,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.gray[200],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },
  inactiveBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  productCategory: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing[1],
  },
  productPrice: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
  },
  productPriceWarning: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning.main,
    fontStyle: 'italic',
  },
  productStats: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  productStatText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray[500],
  },
});
