import { create } from 'zustand'
import axios from 'axios'

const PORT = import.meta.env.VITE_PORT

const useMarketStore = create((set) => ({
  crops: [],
  loading: false,
  initialized: false,

  getAllCrops: async () => {
    set({ loading: true })
    try {
      const response = await axios.get(`http://localhost:${PORT}/api/market/getAllCrops`)
      set({ crops: response.data.crops, loading: false, initialized: true })
    } catch (error) {
      console.error('Failed to fetch market crops:', error)
      set({ loading: false, initialized: true })
    }
  },
}))

export default useMarketStore