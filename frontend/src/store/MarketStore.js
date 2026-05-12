import { create } from 'zustand'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const useMarketStore = create((set, get) => ({
  farms: [],
  crops: [],
  selectedFarm: null,
  farmCrops: [],

  loading: false,
  farmLoading: false,
  initialized: false,

  getAllCrops: async () => {
    const { initialized, crops, loading } = get()
    if (initialized && crops.length > 0) return
    set({ loading: true })
    try {
      const response = await axios.get(`${BASE_URL}/api/market/getAllCrops`)
      set({ crops: response.data.crops, loading: false, initialized: true })
    } catch (error) {
      console.error('Failed to fetch market crops:', error)
      set({ loading: false, initialized: true })
    }
  },

  getAllFarms: async () => {
    const { initialized, farms, loading } = get()
    if (initialized && farms.length > 0) return
    set({ loading: true })
    try {
      const response = await axios.get(`${BASE_URL}/api/market/getAllFarms`)
      set({ farms: response.data.farms, loading: false, initialized: true })
    } catch (error) {
      console.error('Failed to fetch Farms', error)
      set({ loading: false, initialized: true })
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