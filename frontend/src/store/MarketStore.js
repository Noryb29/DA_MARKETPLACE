import { create } from 'zustand'
import axios from 'axios'

const PORT = import.meta.env.VITE_PORT

const useMarketStore = create((set) => ({
  farms: [],
  crops: [],
  selectedFarm: null,
  farmCrops: [],

  loading: false,
  farmLoading: false,
  initialized: false,

  // ✅ Get all crops (for marketplace)
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

  // ✅ Get all farms
  getAllFarms: async () => {
    set({ loading: true })
    try {
      const response = await axios.get(`http://localhost:${PORT}/api/market/getAllFarms`)
      set({ farms: response.data.farms, loading: false, initialized: true })
    } catch (error) {
      console.error('Failed to fetch Farms', error)
      set({ loading: false, initialized: true })
    }
  },

  // ✅ NEW: Get single farm
  getFarmById: async (farmId) => {
    set({ farmLoading: true })
    try {
      const response = await axios.get(`http://localhost:${PORT}/api/market/farm/${farmId}`)
      set({ selectedFarm: response.data.farm, farmLoading: false })
    } catch (error) {
      console.error('Failed to fetch farm:', error)
      set({ farmLoading: false })
    }
  },

  // ✅ NEW: Get crops of a farm
  getCropsByFarmId: async (farmId) => {
  set({ farmLoading: true })
  try {
    const response = await axios.get(
      `http://localhost:${PORT}/api/market/farm/${farmId}/crops`
    )
    set({ farmCrops: response.data.crops, farmLoading: false })
  } catch (error) {
    console.error('Failed to fetch farm crops:', error)
    set({ farmLoading: false })
  }
},

  // ✅ BEST: Fetch both at once
  getFarmDetails: async (farmId) => {
  set({ farmLoading: true })
  try {
    const [farmRes, cropsRes] = await Promise.all([
      axios.get(`http://localhost:${PORT}/api/market/farm/${farmId}`),
      axios.get(`http://localhost:${PORT}/api/market/farm/${farmId}/crops`)
    ])

    set({
      selectedFarm: farmRes.data.farm,
      farmCrops: cropsRes.data.crops,
      farmLoading: false
    })
  } catch (error) {
    console.error('Failed to fetch farm details:', error)
    set({ farmLoading: false })
  }
},

  // ✅ Optional cleanup (very useful)
  clearFarmDetails: () => {
    set({ selectedFarm: null, farmCrops: [] })
  }
}))

export default useMarketStore