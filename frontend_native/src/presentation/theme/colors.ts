/**
 * Theme Colors
 * Color palette for the application
 */

export const colors = {
  // Primary colors
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Secondary colors
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Semantic colors
  success: {
    light: '#10B981',
    main: '#059669',
    dark: '#047857',
  },

  error: {
    light: '#F87171',
    main: '#EF4444',
    dark: '#DC2626',
  },

  warning: {
    light: '#FBBF24',
    main: '#F59E0B',
    dark: '#D97706',
  },

  info: {
    light: '#60A5FA',
    main: '#3B82F6',
    dark: '#2563EB',
  },

  // Grayscale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Order status colors
  orderStatus: {
    queued: '#6B7280',
    in_progress: '#3B82F6',
    ready: '#10B981',
    paid: '#8B5CF6',
    completed: '#14B8A6',
    cancelled: '#EF4444',
  },

  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ThemeColors = typeof colors;

