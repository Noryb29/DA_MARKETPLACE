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
  farmDocuments: [],
  
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

  updateFarm: async (farm_id, farmData) => {
    set({ loading: true })
    const token = localStorage.getItem('farmer_token')
    
    const formData = new FormData()
    Object.keys(farmData).forEach(key => {
      if (key === 'farm_image') {
        if (farmData[key]) formData.append('farm_image', farmData[key])
      } else if (farmData[key] !== undefined && farmData[key] !== null) {
        formData.append(key, farmData[key])
      }
    })

    try {
      const response = await axios.put(
        `${BASE_URL}/api/farmers/updateFarm/${farm_id}`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )
      Swal.fire({ title: 'Success!', text: 'Farm updated successfully.', icon: 'success', timer: 2000, showConfirmButton: false })

      await get().getFarm()
      await get().getFarms()

      set({ loading: false })
      return response.data
    } catch (error) {
      set({ loading: false })
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to update farm', icon: 'error' })
      throw error
    }
  },

  deleteFarm: async (farm_id) => {
    const token = localStorage.getItem('farmer_token')
    try {
      const result = await Swal.fire({
        title: 'Delete Farm?',
        text: 'This will also delete all crops associated with this farm. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it',
      })
      if (!result.isConfirmed) return

      await axios.delete(
        `${BASE_URL}/api/farmers/deleteFarm/${farm_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      Swal.fire({ title: 'Deleted', text: 'Farm removed.', icon: 'success', timer: 2000, showConfirmButton: false })
      
      await get().getFarms()
      await get().getFarm()
      await get().getCrops()
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to delete farm', icon: 'error' })
      throw error
    }
  },

  addFarmDocument: async (farm_id, files) => {
    console.log('=== Store: addFarmDocument ===')
    console.log('farm_id:', farm_id)
    console.log('files:', files)
    const token = localStorage.getItem('farmer_token')
    const formData = new FormData()
    files.forEach(file => formData.append('farm_docs', file))
    
    try {
      console.log('Sending request to:', `${BASE_URL}/api/farmers/farm/${farm_id}/documents`)
      const response = await axios.post(
        `${BASE_URL}/api/farmers/farm/${farm_id}/documents`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      )
      console.log('Response:', response.data)
      await get().getFarmDocuments(farm_id)
      Swal.fire({ title: 'Success!', text: 'Document uploaded successfully.', icon: 'success', timer: 2000, showConfirmButton: false })
      return response.data
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message)
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to upload document', icon: 'error' })
      throw error
    }
  },

  getFarmDocuments: async (farm_id) => {
    const token = localStorage.getItem('farmer_token')
    try {
      const response = await axios.get(
        `${BASE_URL}/api/farmers/farm/${farm_id}/documents`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ farmDocuments: response.data.documents })
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  },

  deleteFarmDocument: async (doc_id, farm_id) => {
    const token = localStorage.getItem('farmer_token')
    try {
      await axios.delete(
        `${BASE_URL}/api/farmers/documents/${doc_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await get().getFarmDocuments(farm_id)
      Swal.fire({ title: 'Deleted', text: 'Document removed.', icon: 'success', timer: 1500, showConfirmButton: false })
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Failed to delete document', icon: 'error' })
    }
  },

}))

export default useFarmerStore
