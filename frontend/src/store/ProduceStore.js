import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const PORT = import.meta.env.VITE_PORT

const useProduceStore = create((set, get) => ({
  crops: [],
  cropsLoading: false,
  cropsInitialized: false,

  getCrops: async () => {
    set({ cropsLoading: true })
    const token = localStorage.getItem('farmer_token')
    try {
      const response = await axios.get(
        `http://localhost:${PORT}/api/produce/getCrops`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ crops: response.data.crops, cropsLoading: false, cropsInitialized: true })
    } catch (error) {
      set({ cropsLoading: false, cropsInitialized: true })
      console.error('Failed to fetch crops:', error)
    }
  },

  addCrop: async (cropData) => {
    set({ cropsLoading: true })
    const token = localStorage.getItem('farmer_token')
    try {
      await axios.post(
        `http://localhost:${PORT}/api/produce/addCrop`,
        cropData,
        { headers: { Authorization: `Bearer ${token}` } }
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
      await axios.put(
        `http://localhost:${PORT}/api/produce/updateCrop/${crop_id}`,
        cropData,
        { headers: { Authorization: `Bearer ${token}` } }
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
        `http://localhost:${PORT}/api/produce/deleteCrop/${crop_id}`,
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
