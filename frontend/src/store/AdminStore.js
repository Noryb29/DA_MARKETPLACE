import axios from "axios";
import { create } from "zustand";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = BASE_URL.replace(/\/api\/?$/, '');

console.log('Admin Store - API URL:', API_URL);

// Add axios interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useAdminStore = create((set, get) => ({
  // State
  products: [],
  farms: [],
  users: [],
  farmers: [],
  orders: [],
  loading: false,
  error: null,
  lastFetched: null,

  // Get All Products (Crops)
  getAllProducts: async (forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/products`);
      if (response.data.success) {
        set({
          products: response.data.data || [],
          loading: false,
          lastFetched: new Date().toISOString(),
        });
        return response.data.data || [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error fetching products:", errorMessage);
      throw error;
    }
  },

  // Get All Farms
  getAllFarms: async (forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/farms`);
      if (response.data.success) {
        set({
          farms: response.data.data || [],
          loading: false,
          lastFetched: new Date().toISOString(),
        });
        return response.data.data || [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error fetching farms:", errorMessage);
      throw error;
    }
  },

  // Get All Users (Buyers)
  getAllUsers: async (forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`);
      if (response.data.success) {
        set({
          users: response.data.data || [],
          loading: false,
          lastFetched: new Date().toISOString(),
        });
        return response.data.data || [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error fetching users:", errorMessage);
      throw error;
    }
  },

  // Update User
  updateUser: async (userId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}`,
        updateData
      );

      if (response.data.success) {
        // Update the users array in state
        const updatedUsers = get().users.map((user) =>
          user.user_id === userId ? { ...user, ...response.data.data } : user
        );
        set({ users: updatedUsers, loading: false });
        return response.data.data;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error updating user:", errorMessage);
      throw error;
    }
  },

  // Get All Farmers
  getAllFarmers: async (forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/farmers`);
      if (response.data.success) {
        set({
          farmers: response.data.data || [],
          loading: false,
          lastFetched: new Date().toISOString(),
        });
        return response.data.data || [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error fetching farmers:", errorMessage);
      throw error;
    }
  },

  // Update Farmer
  updateFarmer: async (farmerId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/farmers/${farmerId}`,
        updateData
      );

      if (response.data.success) {
        // Update the farmers array in state
        const updatedFarmers = get().farmers.map((farmer) =>
          farmer.user_id === farmerId ? { ...farmer, ...response.data.data } : farmer
        );
        set({ farmers: updatedFarmers, loading: false });
        return response.data.data;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error updating farmer:", errorMessage);
      throw error;
    }
  },

  // Get All Orders
  getAllOrders: async (forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/orders`);
      if (response.data.success) {
        set({
          orders: response.data.data || [],
          loading: false,
          lastFetched: new Date().toISOString(),
        });
        return response.data.data || [];
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error fetching orders:", errorMessage);
      throw error;
    }
  },

  // Refresh all data
  refreshAllData: async () => {
    set({ loading: true, error: null });
    try {
      const results = await Promise.all([
        axios.get(`${API_URL}/api/admin/products`),
        axios.get(`${API_URL}/api/admin/farms`),
        axios.get(`${API_URL}/api/admin/users`),
        axios.get(`${API_URL}/api/admin/farmers`),
        axios.get(`${API_URL}/api/admin/orders`),
      ]);

      set({
        products: results[0].data.data || [],
        farms: results[1].data.data || [],
        users: results[2].data.data || [],
        farmers: results[3].data.data || [],
        orders: results[4].data.data || [],
        loading: false,
        lastFetched: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error refreshing data:", errorMessage);
      throw error;
    }
  },

  // Helper: Clear state
  clearState: () => {
    set({
      products: [],
      farms: [],
      users: [],
      farmers: [],
      orders: [],
      loading: false,
      error: null,
      lastFetched: null,
    });
  },

  // Helper: Clear error
  clearError: () => {
    set({ error: null });
  },

  // Helper: Get dashboard statistics
  getStatistics: () => {
    const state = get();
    return {
      totalOrders: state.orders.length,
      totalUsers: state.users.length,
      totalFarmers: state.farmers.length,
      totalProducts: state.products.length,
      totalFarms: state.farms.length,
      lowStockProducts: state.products.filter(p => (p.stock || 0) < 10).length,
      totalStock: state.products.reduce((sum, p) => sum + (p.stock || 0), 0),
      totalVolume: state.orders.reduce((sum, o) => sum + (o.volume || 0), 0),
      activeOrders: state.orders.filter(o => new Date(o.expected_arrival) >= new Date()).length,
      averageOrderSize: state.orders.length > 0 ? Math.round(state.orders.reduce((sum, o) => sum + (o.quantity || 0), 0) / state.orders.length) : 0,
    };
  },
}));