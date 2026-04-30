import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const useProduceStore = create((set, get) => ({
  crops: [],
  cropsLoading: false,
  cropsInitialized: false,

  getCrops: async () => {
    set({ cropsLoading: true })
    const token = localStorage.getItem('farmer_token')
    try {
      const response = await axios.get(
        `${BASE_URL}/api/produce/getCrops`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const cropsWithFullUrl = response.data.crops.map(crop => ({
        ...crop,
        harvest_photo: crop.harvest_photo ? `${BASE_URL}${crop.harvest_photo}` : null
      }))
      set({ crops: cropsWithFullUrl, cropsLoading: false, cropsInitialized: true })
    } catch (error) {
      set({ cropsLoading: false, cropsInitialized: true })
      console.error('Failed to fetch crops:', error)
    }
  },

  addCrop: async (cropData) => {
    set({ cropsLoading: true })
    const token = localStorage.getItem('farmer_token')
    try {
      const formData = new FormData()
      Object.keys(cropData).forEach((key) => {
        if (key === 'harvest_photo' && cropData[key] instanceof File) {
          formData.append(key, cropData[key])
        } else if (cropData[key] !== undefined && cropData[key] !== null) {
          formData.append(key, cropData[key])
        }
      })
      await axios.post(
        `${BASE_URL}/api/produce/addCrop`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      )
      Swal.fire({ title: 'Success!', text: 'Crop added successfully.', icon: 'success', timer: 2000, showConfirmButton: false })
      await get().getCrops()
      set({ cropsLoading: false })
    } catch (error) {
      set({ cropsLoading: false })
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to add crop', icon: 'error' })
      throw error
    }
  },

  updateCrop: async (crop_id, cropData) => {
    set({ cropsLoading: true })
    const token = localStorage.getItem('farmer_token')
    try {
      const formData = new FormData()
      Object.keys(cropData).forEach((key) => {
        if (key === 'harvest_photo' && cropData[key] instanceof File) {
          formData.append(key, cropData[key])
        } else if (key === 'harvest_photo' && typeof cropData[key] === 'string') {
          formData.append(key, cropData[key])
        } else if (cropData[key] !== undefined && cropData[key] !== null) {
          formData.append(key, cropData[key])
        }
      })
      await axios.put(
        `${BASE_URL}/api/produce/updateCrop/${crop_id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      )
      Swal.fire({ title: 'Updated!', text: 'Crop updated successfully.', icon: 'success', timer: 2000, showConfirmButton: false })
      await get().getCrops()
      set({ cropsLoading: false })
    } catch (error) {
      set({ cropsLoading: false })
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to update crop', icon: 'error' })
      throw error
    }
  },

  deleteCrop: async (crop_id) => {
    const token = localStorage.getItem('farmer_token')
    const confirm = await Swal.fire({
      title: 'Delete Crop?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    })
    if (!confirm.isConfirmed) return

    try {
      await axios.delete(
        `${BASE_URL}/api/produce/deleteCrop/${crop_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      Swal.fire({ title: 'Deleted!', text: 'Crop removed.', icon: 'success', timer: 2000, showConfirmButton: false })
      await get().getCrops()
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to delete crop', icon: 'error' })
    }
  },
}))

export default useProduceStore
