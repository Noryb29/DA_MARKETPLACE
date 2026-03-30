import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const PORT = import.meta.env.VITE_PORT

const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,

  register: async (userData) => {
    set({ loading: true })
    try {
      const response = await axios.post(
        `http://localhost:${PORT}/api/auth/user/register`,
        userData
      )
      const { user, token } = response.data
      localStorage.setItem('token', token)
      set({ user, isAuthenticated: true, loading: false })
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
        `http://localhost:${PORT}/api/auth/user/login`,
        { email, password }
      )
      const { user, token } = response.data
      localStorage.setItem('token', token)
      set({ user, isAuthenticated: true, loading: false })
      return user
    } catch (error) {
      set({ loading: false })
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    Swal.fire({
      title: 'Logged Out',
      text: 'See you next time!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    })
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true })
    const token = localStorage.getItem('token')
    if (!token) return set({ isCheckingAuth: false })
    try {
      const response = await axios.get(
        `http://localhost:${PORT}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false })
    } catch (error) {
      console.error('Auth check failed:', error.response?.status, error.response?.data?.message)
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isCheckingAuth: false })
    }
  },
}))

export default useUserStore