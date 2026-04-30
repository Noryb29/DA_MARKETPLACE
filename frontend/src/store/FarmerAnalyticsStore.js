import { create } from 'zustand'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const useFarmerAnalyticsStore = create((set, get) => ({
  stats: null,
  loading: false,
  error: null,

  fetchFarmerStats: async () => {
    set({ loading: true, error: null })
    const token = localStorage.getItem('farmer_token')
    try {
      const response = await axios.get(
        `${BASE_URL}/api/analytics/farmer-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ stats: response.data.data, loading: false })
    } catch (error) {
      set({ loading: false, error: error.message })
      console.error('Failed to fetch farmer stats:', error)
    }
  },
}))

export default useFarmerAnalyticsStore