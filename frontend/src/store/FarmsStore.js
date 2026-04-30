import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const useFarmerStore = create((set, get) => ({
  loading: false,
  farms:[],
  crops: [],
  farm: null,
  hasFarm: false,
  farmLoading: false,
  farmInitialized: false,
  
  addFarm: async (farmData) => {
  set({ loading: true })
  const token = localStorage.getItem('farmer_token')
  
  const formData = new FormData()
  Object.keys(farmData).forEach(key => {
    if (key === 'farm_docs') {
      if (farmData[key] && farmData[key].length > 0) {
        farmData[key].forEach(file => formData.append('farm_docs', file))
      }
    } else if (key === 'farm_image') {
      if (farmData[key]) formData.append('farm_image', farmData[key])
    } else if (farmData[key] !== undefined && farmData[key] !== null) {
      formData.append(key, farmData[key])
    }
  })

  try {
    const response = await axios.post(
      `${BASE_URL}/api/farmers/addFarm`,
      formData,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      }
    )
    Swal.fire({ title: 'Success!', text: 'Farm registered successfully.', icon: 'success', timer: 2000, showConfirmButton: false })

    // Refresh both single farm reference and full list
    await get().getFarm()
    await get().getFarms()

    set({ loading: false })
    return response.data
  } catch (error) {
    set({ loading: false })
    Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to save farm', icon: 'error' })
    throw error
  }
},
  getFarm: async () => {
    set({ farmLoading: true })
    const token = localStorage.getItem('farmer_token')

    try {
      const response = await axios.get(
        `${BASE_URL}/api/farmers/getFarm`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      set({
        hasFarm: response.data.hasFarm,
        farm: response.data.farm,
        farmLoading: false,
        farmInitialized: true,
      })
    } catch (error) {
      set({ farmLoading: false, farmInitialized: true })
      console.error('Failed to fetch farm:', error)
    }
  },

  getCrops: async () => {
    const token = localStorage.getItem('farmer_token')

    try {
      const response = await axios.get(
        `${BASE_URL}/api/farmers/getCrops`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ crops: response.data.crops })
    } catch (error) {
      console.error('Failed to fetch crops:', error)
    }
  },

getFarms: async () => {
  const token = localStorage.getItem('farmer_token')
  try {
    const response = await axios.get(
      `${BASE_URL}/api/farmers/getFarms`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    set({ farms: response.data.farms })
  } catch (error) {
    console.error('Failed to fetch farms:', error)
  }
},

}))

export default useFarmerStore
