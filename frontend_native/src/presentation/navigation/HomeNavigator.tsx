/**
 * Home Navigator
 * Home/Dashboard stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { DashboardScreen } from '@screens/home/DashboardScreen';
import { ProfileScreen } from '@screens/home/ProfileScreen';
import type { HomeStackParamList } from './types';
import { theme } from '@theme/index';

const Stack = createNativeStackNavigator<HomeStackParamList>();

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

export function HomeNavigator() {
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
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
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

