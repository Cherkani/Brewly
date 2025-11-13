/**
 * Orders Navigator
 * Orders management stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { OrdersListScreen } from '@screens/orders/OrdersListScreen';
import { OrderDetailScreen } from '@screens/orders/OrderDetailScreen';
import type { OrdersStackParamList } from './types';
import { theme } from '@theme/index';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

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

export function OrdersNavigator() {
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

