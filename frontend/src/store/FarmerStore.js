import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const PORT = import.meta.env.VITE_PORT

const useFarmerStore = create((set, get) => ({
  loading: false,
  farm: null,
  hasFarm: false,
  farmLoading: false,
  farmInitialized: false,
  
  addFarm: async (farmData) => {
    set({ loading: true })
    const token = localStorage.getItem('token')
    
    try {
      const response = await axios.post(
        `http://localhost:${PORT}/api/farmers/addFarm`, 
        farmData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      Swal.fire({
        title: 'Success!',
        text: 'Farm details saved successfully.',
        icon: 'success',
        timer: 2000
      })
      
      // Refresh farm status after adding
      await get().getMyFarm()
      
      set({ loading: false })
      return response.data
    } catch (error) {
      set({ loading: false })
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save farm',
        icon: 'error'
      })
      throw error
    }
  },

}))

export default useFarmerStore