import { create } from 'zustand'
import { farmerApi } from '../lib/api'

const useFarmerAuthStore = create((set, get) => ({
  farmer: null,
  farmerDetails: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,

  register: async (farmerData) => {
    set({ loading: true })
    try {
      const { data } = await farmerApi.post('/api/auth/farmer/register', farmerData)
      const { user, token } = data
      localStorage.removeItem('token')
      localStorage.setItem('farmer_token', token)
      set({ farmer: user, isAuthenticated: true, loading: false, isCheckingAuth: false })
      return user
    } catch (error) {
      set({ loading: false })
      const message = error.response?.data?.message || error.message || 'Registration failed'
      return { error: message }
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data } = await farmerApi.post('/api/auth/farmer/login', { email, password })
      const { user, token } = data
      localStorage.removeItem('token')
      localStorage.setItem('farmer_token', token)
      set({ farmer: user, isAuthenticated: true, loading: false, isCheckingAuth: false })
      return user
    } catch (error) {
      set({ loading: false })
      const message = error.response?.data?.message || error.message || 'Login failed'
      return { error: message }
    }
  },

  logout: async () => {
    localStorage.removeItem('farmer_token')
    localStorage.removeItem('token')
    set({ farmer: null, farmerDetails: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true })
    const token = localStorage.getItem('farmer_token')
    if (!token) return set({ isCheckingAuth: false })
    try {
      const { data } = await farmerApi.get('/api/auth/farmer/me')
      set({ farmer: data.user, isAuthenticated: true, isCheckingAuth: false })
    } catch {
      localStorage.removeItem('farmer_token')
      set({ farmer: null, isAuthenticated: false, isCheckingAuth: false })
    }
  },

  fetchFarmerDetails: async () => {
    try {
      const { data } = await farmerApi.get('/api/auth/farmer/me/details')
      set({ farmerDetails: data.details })
      return data.details
    } catch (error) {
      if (error.response?.status === 404) {
        set({ farmerDetails: null })
        return null
      }
      throw error
    }
  },

  saveFarmerDetails: async (details) => {
    set({ loading: true })
    try {
      const existing = get().farmerDetails
      let result
      if (existing) {
        const { data } = await farmerApi.put('/api/auth/farmer/me/details', details)
        result = data.details
      } else {
        const { data } = await farmerApi.post('/api/auth/farmer/me/details', details)
        result = data.details
      }
      set({ farmerDetails: result, loading: false })
      return result
    } catch (error) {
      set({ loading: false })
      const message = error.response?.data?.message || error.message || 'Save failed'
      return { error: message }
    }
  },
}))

export default useFarmerAuthStore