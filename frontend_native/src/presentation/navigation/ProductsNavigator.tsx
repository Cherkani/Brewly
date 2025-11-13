/**
 * Products Navigator
 * App products and settings stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { MenuScreen } from '@screens/products/ProductsScreen';
import { SettingsScreen } from '@screens/products/SettingsScreen';
import type { MenuStackParamList } from './types';
import { theme } from '@theme/index';

const Stack = createNativeStackNavigator<MenuStackParamList>();

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

export function MenuNavigator() {
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
        name="MenuList"
        component={MenuScreen}
        options={{ title: 'Products' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
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

