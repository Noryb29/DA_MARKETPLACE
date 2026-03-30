import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const PORT = import.meta.env.VITE_PORT
const BASE  = `http://localhost:${PORT}/api/orders`

const useOrderStore = create((set, get) => ({
  myOrders:           [],
  farmerOrders:       [],
  loading:            false,
  initialized:        false,
  farmerInitialized:  false,

  placeOrder: async (items) => {
    set({ loading: true })
    const token = localStorage.getItem('token')         // buyer uses user token
    try {
      await axios.post(`${BASE}/placeOrder`, { items }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      Swal.fire({ title: 'Order Placed!', text: 'Your order has been submitted.', icon: 'success', timer: 2000, showConfirmButton: false })
      await get().getMyOrders()
      set({ loading: false })
      return true
    } catch (error) {
      set({ loading: false })
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to place order.', icon: 'error' })
      return false
    }
  },

  getMyOrders: async () => {
    set({ loading: true })
    const token = localStorage.getItem('token')         // buyer token
    try {
      const res = await axios.get(`${BASE}/getMyOrders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ myOrders: res.data.orders, loading: false, initialized: true })
    } catch (error) {
      console.error(error)
      set({ loading: false, initialized: true })
    }
  },

  getFarmerOrders: async () => {
    set({ loading: true })
    const token = localStorage.getItem('farmer_token')  // farmer token
    try {
      const res = await axios.get(`${BASE}/getFarmerOrders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ farmerOrders: res.data.orders, loading: false, farmerInitialized: true })
    } catch (error) {
      console.error(error)
      set({ loading: false, farmerInitialized: true })
    }
  },
}))

export default useOrderStore