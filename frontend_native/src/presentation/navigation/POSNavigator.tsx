/**
 * POS Navigator
 * Point of Sale stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { POSScreen } from '@screens/pos/POSScreen';
import { ProductDetailScreen } from '@screens/pos/ProductDetailScreen';
import { CheckoutScreen } from '@screens/pos/CheckoutScreen';
import type { POSStackParamList } from './types';

const Stack = createNativeStackNavigator<POSStackParamList>();

export function POSNavigator() {
  return (
    <Stack.Navigator>
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

