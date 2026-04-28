import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem('token')
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('farmer_token')
    }
    return Promise.reject(error)
  }
)

export const farmerApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

farmerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmer_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

farmerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('farmer_token')
    }
    return Promise.reject(error)
  }
)

export default api