/**
 * Orders Navigator
 * Orders management stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersListScreen } from '@screens/orders/OrdersListScreen';
import { OrderDetailScreen } from '@screens/orders/OrderDetailScreen';
import type { OrdersStackParamList } from './types';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ title: 'Orders' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
    </Stack.Navigator>
  );
}

