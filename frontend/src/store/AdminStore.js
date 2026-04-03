import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

export const useAdminStore = create((set, get) => ({
  // State
  products: [],
  farms: [],
  users: [],
  farmers: [],
  orders: [],
  loading: false,
  error: null,

  // Get All Products (Crops)
  getAllProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/products`);
      set({ products: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error fetching products:", errorMessage);
      throw error;
    }
  },

  // Get All Farms
  getAllFarms: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/farms`);
      set({ farms: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error fetching farms:", errorMessage);
      throw error;
    }
  },

  // Get All Users (Buyers)
  getAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`);
      set({ users: response.data.data, loading: false });
      return response.data.data;
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
        `${API_URL}/admin/users/${userId}`,
        updateData
      );
      
      // Update the users array in state
      const updatedUsers = get().users.map((user) =>
        user.user_id === userId ? { ...user, ...response.data.data } : user
      );
      set({ users: updatedUsers, loading: false });
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error updating user:", errorMessage);
      throw error;
    }
  },

  // Get All Farmers
  getAllFarmers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/farmers`);
      set({ farmers: response.data.data, loading: false });
      return response.data.data;
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
        `${API_URL}/admin/farmers/${farmerId}`,
        updateData
      );
      
      // Update the farmers array in state
      const updatedFarmers = get().farmers.map((farmer) =>
        farmer.user_id === farmerId ? { ...farmer, ...response.data.data } : farmer
      );
      set({ farmers: updatedFarmers, loading: false });
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error updating farmer:", errorMessage);
      throw error;
    }
  },

  // Get All Orders
  getAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/admin/orders`);
      set({ orders: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      console.error("Error fetching orders:", errorMessage);
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
    });
  },

  // Helper: Clear error
  clearError: () => {
    set({ error: null });
  },
}));