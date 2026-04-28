import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const BASE_URL = import.meta.env.VITE_BASE_URL

const useFarmerAuthStore = create((set) => ({
  farmer: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,

  register: async (farmerData) => {
    set({ loading: true })
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/farmer/register`,
        farmerData
      )

      const { user, token } = response.data
      localStorage.removeItem('token')
      localStorage.setItem('farmer_token', token)

      set({
        farmer: user,
        isAuthenticated: true,
        loading: false,
        isCheckingAuth: false
      })

      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        timer: 1500,
        showConfirmButton: false
      })

      return user
    } catch (error) {
      set({ loading: false })

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed'

      await Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: message,
        confirmButtonColor: '#166534'
      })

      return null
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/farmer/login`,
        { email, password }
      )

      const { user, token } = response.data
      localStorage.removeItem('token')
      localStorage.setItem('farmer_token', token)

      set({
        farmer: user,
        isAuthenticated: true,
        loading: false,
        isCheckingAuth: false
      })

      await Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        timer: 1500,
        showConfirmButton: false
      })

      return user
    } catch (error) {
      set({ loading: false })

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed'

      await Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: message,
        confirmButtonColor: '#166534'
      })

      return null
    }
  },

  logout: async () => {
    localStorage.removeItem('farmer_token')
    localStorage.removeItem('token')

    await Swal.fire({
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
        `${BASE_URL}/api/auth/farmer/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      set({
        farmer: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false
      })
    } catch (error) {
      localStorage.removeItem('farmer_token')
      set({
        farmer: null,
        isAuthenticated: false,
        isCheckingAuth: false
      })
    }
  },
}))

export default useFarmerAuthStore