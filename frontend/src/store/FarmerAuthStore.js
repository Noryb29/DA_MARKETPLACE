import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const PORT = import.meta.env.VITE_PORT

const useFarmerAuthStore = create((set) => ({
  farmer: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,

  register: async (farmerData) => {
    set({ loading: true })
    try {
      const response = await axios.post(
        `http://localhost:${PORT}/api/auth/farmer/register`,
        farmerData
      )
      const { user, token } = response.data
      localStorage.removeItem('token')
      localStorage.setItem('farmer_token', token)
      set({ farmer: user, isAuthenticated: true, loading: false, isCheckingAuth: false })
      return user
    } catch (error) {
      set({ loading: false })
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const response = await axios.post(
        `http://localhost:${PORT}/api/auth/farmer/login`,
        { email, password }
      )
      const { user, token } = response.data
      localStorage.removeItem('token')
      localStorage.setItem('farmer_token', token)
      set({ farmer: user, isAuthenticated: true, loading: false, isCheckingAuth: false })
      return user
    } catch (error) {
      set({ loading: false })
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  logout: () => {
    localStorage.removeItem('farmer_token')
    localStorage.removeItem('token')
    Swal.fire({
      title: 'Logged Out',
      text: 'See you next time!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    })
    set({ farmer: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true })
    const token = localStorage.getItem('farmer_token')
    if (!token) return set({ isCheckingAuth: false })
    try {
      const response = await axios.get(
        `http://localhost:${PORT}/api/auth/farmer/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ farmer: response.data.user, isAuthenticated: true, isCheckingAuth: false })
    } catch (error) {
      console.error('Farmer auth check failed:', error.response?.status, error.response?.data?.message)
      localStorage.removeItem('farmer_token')
      set({ farmer: null, isAuthenticated: false, isCheckingAuth: false })
    }
  },
}))

export default useFarmerAuthStore