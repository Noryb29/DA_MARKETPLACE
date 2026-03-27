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
      const response = await axios.post(`http://localhost:${PORT}/api/users/register`, userData)

      const { user, token } = response.data

      // Store token in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role)

      set({
        user,
        isAuthenticated: true,
        loading: false,
      })

      return user
    } catch (error) {
      set({ loading: false })
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const response = await axios.post(`http://localhost:${PORT}/api/users/login`, {
        email,
        password,
      })

      const { user, token } = response.data

      // Store token in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role)

      set({
        user,
        isAuthenticated: true,
        loading: false,
      })

      return user
    } catch (error) {
      set({ loading: false })
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  logout: () => {
    localStorage.removeItem('role')
    localStorage.removeItem('token')
    Swal.fire({
        title:'Logout Success',
        text:'User Logged Out Succesfully',
        icon:"success",
        timer:'1000'
    })
    set({
      user: null,
      isAuthenticated: false,
    })
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true })
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await axios.get(`http://localhost:${PORT}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        set({
          user: response.data.user,
          isAuthenticated: true,
          isCheckingAuth: false,
        })
      } catch (error) {
        localStorage.removeItem('role')
        localStorage.removeItem('token')
        set({
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        })
      }
    } else {
      set({ isCheckingAuth: false })
    }
  },
}))

export default useUserStore