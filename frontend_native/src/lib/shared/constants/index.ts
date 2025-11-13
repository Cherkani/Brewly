/**
 * Shared Constants
 * Application-wide constant values
 */

export const ORDER_STATUSES = [
  'queued',
  'in_progress',
  'ready',
  'paid',
  'completed',
  'cancelled',
] as const;

export const PAYMENT_METHODS = [
  'cash',
  'credit_card',
  'debit_card',
  'mobile_payment',
] as const;

export const USER_ROLES = ['owner', 'admin', 'cashier'] as const;

export const QUERY_STALE_TIME = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 2 * 60 * 1000, // 2 minutes
  LONG: 5 * 60 * 1000, // 5 minutes
};

