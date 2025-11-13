/**
 * POS Navigator
 * Point of Sale stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { POSScreen } from '@screens/pos/POSScreen';
import { ProductDetailScreen } from '@screens/pos/ProductDetailScreen';
import { CheckoutScreen } from '@screens/pos/CheckoutScreen';
import type { POSStackParamList } from './types';
import { theme } from '@theme/index';

const Stack = createNativeStackNavigator<POSStackParamList>();

function MenuButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <Text style={styles.menuIcon}>☰</Text>
    </TouchableOpacity>
  );
}

export function POSNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerLeft: () => <MenuButton />,
        headerStyle: {
          backgroundColor: theme.colors.white,
        },
        headerTintColor: theme.colors.gray[900],
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.semibold,
        },
      }}
    >
      <Stack.Screen
        name="POSMain"
        component={POSScreen}
        options={{ title: 'Point of Sale' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: theme.spacing[4],
    padding: theme.spacing[2],
  },
  menuIcon: {
    fontSize: 24,
    color: theme.colors.gray[900],
  },
});

