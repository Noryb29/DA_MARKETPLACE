import { create } from 'zustand'
import axios from 'axios'
import Swal from 'sweetalert2'

const BASE_URL = import.meta.env.VITE_BASE_URL

const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,

  register: async (userData) => {
    set({ loading: true })
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/user/register`,
        userData
      )

      const { user, token } = response.data
      localStorage.setItem('token', token)

      set({
        user,
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
        `${BASE_URL}/api/auth/user/login`,
        { email, password }
      )

      const { user, token } = response.data
      localStorage.setItem('token', token)

      set({
        user,
        isAuthenticated: true,
        loading: false,
        isCheckingAuth: false
      })

      await Swal.fire({
        icon: 'success',
        title: 'Welcome!',
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
    localStorage.removeItem('token')

    await Swal.fire({
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
        `${BASE_URL}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false
      })
    } catch (error) {
      localStorage.removeItem('token')
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false
      })
    }
  },
}))

export default useUserStore