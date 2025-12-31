import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SelectedOption {
  optionId: string
  optionName: string
  price: number
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  productImage?: string
  quantity: number
  selectedOptions: SelectedOption[]
  specialInstructions?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getTotalWithOptions: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions) &&
              item.specialInstructions === newItem.specialInstructions
          )

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex].quantity += newItem.quantity
            return { items: updatedItems }
          }

          return {
            items: [
              ...state.items,
              {
                ...newItem,
                id: crypto.randomUUID(),
              },
            ],
          }
        })
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
          ).filter((item) => item.quantity > 0),
        }))
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.productPrice * item.quantity,
          0
        )
      },

      getTotalWithOptions: () => {
        return get().items.reduce((total, item) => {
          const basePrice = item.productPrice * item.quantity
          const optionsPrice = item.selectedOptions.reduce(
            (sum, option) => sum + option.price * item.quantity,
            0
          )
          return total + basePrice + optionsPrice
        }, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
