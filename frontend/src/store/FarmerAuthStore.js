import { create } from 'zustand'
import { farmerApi } from '../lib/api'

const useFarmerAuthStore = create((set) => ({
  farmer: null,
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
    set({ farmer: null, isAuthenticated: false })
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
}))

export default useFarmerAuthStore