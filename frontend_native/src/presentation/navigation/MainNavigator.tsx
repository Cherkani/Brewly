/**
 * Main Navigator
 * Main app bottom tab navigation
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeNavigator } from './HomeNavigator';
import { POSNavigator } from './POSNavigator';
import { OrdersNavigator } from './OrdersNavigator';
import { MenuNavigator } from './MenuNavigator';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => null, // Add icons later
        }}
      />
      <Tab.Screen
        name="POS"
        component={POSNavigator}
        options={{
          tabBarLabel: 'POS',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuNavigator}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

