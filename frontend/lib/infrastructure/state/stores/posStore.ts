/**
 * POS Store
 * Point of Sale cart and order state management
 */

import { create } from 'zustand'

interface CartItem {
  productId: string
  productName: string
  sizeId: string
  sizeName: string
  quantity: number
  basePriceInCents: number
  modifiers: Array<{
    id: string
    name: string
    priceDeltaInCents: number
  }>
}

interface POSState {
  // Cart
  cart: CartItem[]
  discountInCents: number
  notes: string

  // Cart actions
  addToCart: (item: CartItem) => void
  updateCartItem: (index: number, updates: Partial<CartItem>) => void
  removeFromCart: (index: number) => void
  clearCart: () => void

  // Discount
  setDiscount: (amountInCents: number) => void

  // Notes
  setNotes: (notes: string) => void

  // Calculations
  getSubtotal: () => number
  getTotal: () => number
  getItemCount: () => number

  // Order state
  isProcessingOrder: boolean
  setIsProcessingOrder: (processing: boolean) => void
}

export const usePOSStore = create<POSState>((set, get) => ({
  // Initial state
  cart: [],
  discountInCents: 0,
  notes: '',
  isProcessingOrder: false,

  // Add item to cart
  addToCart: (item) =>
    set((state) => ({
      cart: [...state.cart, item],
    })),

  // Update cart item
  updateCartItem: (index, updates) =>
    set((state) => ({
      cart: state.cart.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    })),

  // Remove from cart
  removeFromCart: (index) =>
    set((state) => ({
      cart: state.cart.filter((_, i) => i !== index),
    })),

  // Clear cart
  clearCart: () =>
    set({
      cart: [],
      discountInCents: 0,
      notes: '',
    }),

  // Set discount
  setDiscount: (discountInCents) => set({ discountInCents }),

  // Set notes
  setNotes: (notes) => set({ notes }),

  // Calculate subtotal
  getSubtotal: () => {
    const state = get()
    return state.cart.reduce((total, item) => {
      const modifiersTotal = item.modifiers.reduce(
        (sum, mod) => sum + mod.priceDeltaInCents,
        0
      )
      const itemTotal = (item.basePriceInCents + modifiersTotal) * item.quantity
      return total + itemTotal
    }, 0)
  },

  // Calculate total
  getTotal: () => {
    const state = get()
    const subtotal = state.getSubtotal()
    return Math.max(0, subtotal - state.discountInCents)
  },

  // Get item count
  getItemCount: () => {
    const state = get()
    return state.cart.reduce((sum, item) => sum + item.quantity, 0)
  },

  // Set processing order
  setIsProcessingOrder: (processing) => set({ isProcessingOrder: processing }),
}))

