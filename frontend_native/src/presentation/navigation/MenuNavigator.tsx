/**
 * Menu Navigator
 * App menu and settings stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuScreen } from '@screens/menu/MenuScreen';
import { SettingsScreen } from '@screens/menu/SettingsScreen';
import type { MenuStackParamList } from './types';

const Stack = createNativeStackNavigator<MenuStackParamList>();

export function MenuNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MenuList"
        component={MenuScreen}
        options={{ title: 'Menu' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

