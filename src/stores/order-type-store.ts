import { create } from 'zustand'

interface OrderTypeStore {
  orderType: 'delivery' | 'pickup'
  setOrderType: (type: 'delivery' | 'pickup') => void
}

export const useOrderTypeStore = create<OrderTypeStore>((set) => ({
  orderType: 'delivery',
  setOrderType: (type) => set({ orderType: type }),
}))
