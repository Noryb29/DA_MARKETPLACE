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
      const cropsWithFullUrl = response.data.crops.map(crop => ({
        ...crop,
        harvest_photo: crop.harvest_photo ? `${BASE_URL}${crop.harvest_photo}` : null
      }))
      set({ crops: cropsWithFullUrl, loading: false, initialized: true })
    } catch (error) {
      console.error('Failed to fetch market crops:', error)
      set({ loading: false, initialized: true })
    }
  },

  // ✅ Get all farms
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

  // ✅ NEW: Get single farm
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

  // ✅ NEW: Get crops of a farm
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

  // ✅ BEST: Fetch both at once
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

  // ✅ Optional cleanup (very useful)
  clearFarmDetails: () => {
    set({ selectedFarm: null, farmCrops: [] })
  }
}))

export default useMarketStore