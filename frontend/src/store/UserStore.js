import { create } from 'zustand'
import api from '../lib/api'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const useUserStore = create((set, get) => ({
  user: null,
  userDetails: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,

  register: async (userData) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/api/auth/register', userData)
      const { user, token } = data
      localStorage.setItem('token', token)
      set({ user, isAuthenticated: true, loading: false, isCheckingAuth: false })
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
      const { data } = await api.post('/api/auth/login', { email, password })
      const { user, token } = data
      localStorage.setItem('token', token)
      set({ user, isAuthenticated: true, loading: false, isCheckingAuth: false })
      return user
    } catch (error) {
      set({ loading: false })
      const message = error.response?.data?.message || error.message || 'Login failed'
      return { error: message }
    }
  },

  logout: async () => {
    localStorage.removeItem('token')
    set({ user: null, userDetails: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true })
    const token = localStorage.getItem('token')
    if (!token) return set({ isCheckingAuth: false })
    try {
      const { data } = await api.get('/api/auth/me')
      set({ user: data.user, isAuthenticated: true, isCheckingAuth: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isCheckingAuth: false })
    }
  },

  fetchUserDetails: async () => {
    try {
      const { data } = await api.get('/api/auth/me/details')
      const detailsWithFullUrl = data.details ? {
        ...data.details,
        profile_picture: data.details.profile_picture 
          ? (data.details.profile_picture.startsWith('http') ? data.details.profile_picture : `${BASE_URL}${data.details.profile_picture}`)
          : null
      } : null
      set({ userDetails: detailsWithFullUrl })
      return detailsWithFullUrl
    } catch (error) {
      if (error.response?.status === 404) {
        set({ userDetails: null })
        return null
      }
      throw error
    }
  },

  saveUserDetails: async (details) => {
    set({ loading: true })
    try {
      const existing = get().userDetails
      const formData = new FormData()
      Object.keys(details).forEach((key) => {
        if (key === 'profile_picture' && details[key] instanceof File) {
          formData.append(key, details[key])
        } else if (key === 'profile_picture' && typeof details[key] === 'string') {
          formData.append(key, details[key])
        } else if (details[key] !== undefined && details[key] !== null) {
          formData.append(key, details[key])
        }
      })
      
      let result
      if (existing) {
        const { data } = await api.put('/api/auth/me/details', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        result = data.details
      } else {
        const { data } = await api.post('/api/auth/me/details', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        result = data.details
      }
      const resultWithFullUrl = result ? {
        ...result,
        profile_picture: result.profile_picture 
          ? (result.profile_picture.startsWith('http') ? result.profile_picture : `${BASE_URL}${result.profile_picture}`)
          : null
      } : null
      set({ userDetails: resultWithFullUrl, loading: false })
      return resultWithFullUrl
    } catch (error) {
      set({ loading: false })
      const message = error.response?.data?.message || error.message || 'Save failed'
      return { error: message }
    }
  },
}))

export default useUserStore