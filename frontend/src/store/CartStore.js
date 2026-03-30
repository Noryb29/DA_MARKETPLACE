import { create } from 'zustand'
import Swal from 'sweetalert2'

const useCartStore = create((set, get) => ({
  items: [],       // { crop, quantity }
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addToCart: (crop) => {
    const existing = get().items.find((i) => i.crop.crop_id === crop.crop_id)
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.crop.crop_id === crop.crop_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
        isOpen: true,
      })
    } else {
      set({ items: [...get().items, { crop, quantity: 1 }], isOpen: true })
    }
  },

  removeFromCart: (crop_id) => {
    set({ items: get().items.filter((i) => i.crop.crop_id !== crop_id) })
  },

  updateQuantity: (crop_id, quantity) => {
    if (quantity < 1) return get().removeFromCart(crop_id)
    set({
      items: get().items.map((i) =>
        i.crop.crop_id === crop_id ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => set({ items: [] }),

  get totalItems() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0)
  },
}))

export default useCartStore