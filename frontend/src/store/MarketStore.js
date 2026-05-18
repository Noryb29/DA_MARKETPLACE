import { create } from 'zustand'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const useMarketStore = create((set, get) => ({
  farms: [],
  crops: [],
  selectedFarm: null,
  farmCrops: [],

  loading: false,
  farmsLoading: false,
  farmLoading: false,
  initialized: false,
  farmsInitialized: false,

  resetCrops: () => set({ crops: [], initialized: false }),

  getAllCrops: async () => {
    const { loading } = get()
    if (loading) return
    set({ loading: true })
    try {
      console.log('Fetching crops from:', `${BASE_URL}/api/market/getAllCrops`)
      const response = await axios.get(`${BASE_URL}/api/market/getAllCrops`)
      console.log('Crops response:', response.data)
      set({ crops: response.data.crops || [], loading: false, initialized: true })
    } catch (error) {
      console.error('Failed to fetch market crops:', error)
      console.error('Error response:', error.response?.data)
      set({ loading: false, initialized: true })
    }
  },

  getAllFarms: async () => {
    const { farmsLoading } = get()
    if (farmsLoading) return
    set({ farmsLoading: true })
    try {
      console.log('Fetching farms from:', `${BASE_URL}/api/market/getAllFarms`)
      const response = await axios.get(`${BASE_URL}/api/market/getAllFarms`)
      console.log('Farms response:', response.data)
      set({ farms: response.data.farms || [], farmsLoading: false, farmsInitialized: true })
    } catch (error) {
      console.error('Failed to fetch Farms', error)
      console.error('Error response:', error.response?.data)
      set({ farmsLoading: false, farmsInitialized: true })
    }
  },

  getFarmById: async (farmId) => {
    set({ farmLoading: true })
    try {
      const response = await axios.get(`${BASE_URL}/api/market/farm/${farmId}`)
      set({ selectedFarm: response.data.farm, farmLoading: false })
    } catch (error) {
      console.error('Failed to fetch farm:', error)
      set({ farmLoading: false })
    }
  },

  getCropsByFarmId: async (farmId) => {
    set({ farmLoading: true })
    try {
      const response = await axios.get(
        `${BASE_URL}/api/market/farm/${farmId}/crops`
      )
      set({ farmCrops: response.data.crops, farmLoading: false })
    } catch (error) {
      console.error('Failed to fetch farm crops:', error)
      set({ farmLoading: false })
    }
  },

  getFarmDetails: async (farmId) => {
    set({ farmLoading: true })
    try {
      const [farmRes, cropsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/market/farm/${farmId}`),
        axios.get(`${BASE_URL}/api/market/farm/${farmId}/crops`)
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

  clearFarmDetails: () => {
    set({ selectedFarm: null, farmCrops: [] })
  }
}))

export default useMarketStore