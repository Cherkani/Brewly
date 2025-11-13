/**
 * Main Navigator
 * Main app drawer navigation with sidebar
 */

import React from 'react';
import { createDrawerNavigator, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { OrdersNavigator } from './OrdersNavigator';
import { MenuNavigator } from './ProductsNavigator';
import { CustomDrawerContent } from './CustomDrawerContent';
import type { MainTabParamList } from './types';
import { theme } from '@theme/index';

const Drawer = createDrawerNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Orders"
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
          backgroundColor: theme.colors.white,
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerActiveTintColor: theme.colors.primary[600],
        drawerInactiveTintColor: theme.colors.gray[600],
        swipeEnabled: true,
        }}
    >
      <Drawer.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          drawerLabel: 'Orders',
        }}
      />
      <Drawer.Screen
        name="Menu"
        component={MenuNavigator}
        options={{
          drawerLabel: 'Menu',
        }}
      />
    </Drawer.Navigator>
  );
}

