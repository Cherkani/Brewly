/**
 * POS Store
 * Point of Sale cart state management
 */

import { create } from 'zustand';

export interface CartItemModifier {
  id: string;
  name: string;
  priceDeltaInCents: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  sizeId: string;
  sizeName: string;
  quantity: number;
  basePriceInCents: number;
  modifiers: CartItemModifier[];
}

interface POSState {
  cart: CartItem[];
  notes: string;

  // Actions
  addToCart: (item: CartItem) => void;
  updateCartItem: (index: number, updates: Partial<CartItem>) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  setNotes: (notes: string) => void;

  // Computed
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  notes: '',

  addToCart: (item) =>
    set((state) => ({
      cart: [...state.cart, item],
    })),

  updateCartItem: (index, updates) =>
    set((state) => ({
      cart: state.cart.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    })),

  removeFromCart: (index) =>
    set((state) => ({
      cart: state.cart.filter((_, i) => i !== index),
    })),

  clearCart: () =>
    set({
      cart: [],
      notes: '',
    }),

  setNotes: (notes) =>
    set({
      notes,
    }),

  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => {
      const modifiersTotal = item.modifiers.reduce(
        (sum, mod) => sum + mod.priceDeltaInCents,
        0
      );
      return total + (item.basePriceInCents + modifiersTotal) * item.quantity;
    }, 0);
  },

  getCartItemCount: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },
}));

