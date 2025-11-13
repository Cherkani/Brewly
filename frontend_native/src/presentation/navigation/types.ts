/**
 * Navigation Types
 * Type definitions for navigation
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { CompositeScreenProps } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Orders: undefined;
  Menu: undefined;
};

// Home Stack
export type HomeStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

// POS Stack
export type POSStackParamList = {
  POSMain: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
};

// Orders Stack
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

// Menu Stack
export type MenuStackParamList = {
  MenuList: undefined;
  Settings: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    DrawerScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Home and POS stacks are no longer in the main navigation
// Keeping types for potential future use or backward compatibility
export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

export type POSStackScreenProps<T extends keyof POSStackParamList> =
  NativeStackScreenProps<POSStackParamList, T>;

export type OrdersStackScreenProps<T extends keyof OrdersStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OrdersStackParamList, T>,
    MainTabScreenProps<'Orders'>
  >;

export type MenuStackScreenProps<T extends keyof MenuStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MenuStackParamList, T>,
    MainTabScreenProps<'Menu'>
  >;

