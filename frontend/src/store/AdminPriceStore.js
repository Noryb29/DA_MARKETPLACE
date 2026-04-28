import { create } from "zustand"
import axios from "axios"
import Swal from "sweetalert2"

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

export const useAdminPriceStore = create((set, get) => ({
  crops: [],
  markets: [],
  categories: [],
  commodities: [],
  commodityPrices: [],
  isLoading: false,
  error: null,

  fetchCrops: async () => {
    if(get().isLoading) return;
    
    set({ isLoading: true, error: null })

    try {
      const response = await axios.get(`${BASE_URL}/api/crops/`)

      if (!response.data.data || response.data.data.length === 0) {
        set({
          crops: [],
          isLoading: false
        })
        return
      }

      const grouped = {}

      response.data.data.forEach((item) => {
        if (!grouped[item.commodity_id]) {
          grouped[item.commodity_id] = {
            id: item.commodity_id,
            name: item.name,
            specification: item.specification || "",
            categories: item.category,
            price_date: item.price_date,
            price_count: item.price_count,
            respondent_count: item.respondent_count,
            markets: {}
          }
        }

        if (item.market_name) {
          grouped[item.commodity_id].markets[item.market_name] = {
            prevailing: item.prevailing_price,
            high: item.high_price,
            low: item.low_price
          }
        }
      })

      set({
        crops: Object.values(grouped),
        isLoading: false
      })

    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch commodities",
        isLoading: false,
        crops: []
      })
    }
  },

  fetchMarkets: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/crops/markets`)
      set({ markets: response.data.data || [] })
    } catch (error) {
      console.error("Failed to fetch markets:", error)
      set({ error: "Failed to fetch markets" })
    }
  },

  fetchCategories: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/crops/categories`)
      set({ categories: response.data.data || [] })
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      set({ error: "Failed to fetch categories" })
    }
  },

  fetchCommodities: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/crops/commodities`)
      set({ commodities: response.data.data || [] })
    } catch (error) {
      console.error("Failed to fetch commodities:", error)
      set({ error: "Failed to fetch commodities" })
    }
  },

  fetchCommodityPrices: async (commodityId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/crops/commodity/${commodityId}/prices`
      )
      set({ commodityPrices: response.data.data || [] })
      return response.data.data || []
    } catch (error) {
      console.error("Failed to fetch commodity prices:", error)
      return []
    }
  },

  addCommodity: async (formData) => {
    if (!formData.category_id || !formData.name) {
      return { success: false, message: "Category and name are required" }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/commodities`,
        formData
      )

      await get().fetchCrops()

      return response.data
    } catch (err) {
      console.error("addCommodity error:", err)
      return { success: false, message: err.response?.data?.message || "Failed to add commodity" }
    }
  },

  addPriceRecord: async (formData) => {
    if (!formData.commodity_id || !formData.market_id || !formData.price_date) {
      return { success: false, message: "Missing required fields" }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/prices`,
        formData
      )

      await get().fetchCrops()

      return response.data
    } catch (err) {
      if (err.response?.status === 409) {
        return err.response.data
      }
      return { success: false, message: err.response?.data?.message || "Failed to add price record" }
    }
  },

  addCategory: async (name) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/categories`,
        { name }
      )

      await get().fetchCategories()

      return response.data
    } catch (err) {
      console.error("addCategory error:", err)
      return { success: false, message: err.response?.data?.message || "Failed to add category" }
    }
  },

  addMarket: async (name, city = "") => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/markets`,
        { name, city }
      )

      await get().fetchMarkets()

      return response.data
    } catch (err) {
      console.error("addMarket error:", err)
      return { success: false, message: err.response?.data?.message || "Failed to add market" }
    }
  },

  importFormRecords: async (parsed, form) => {
    const data = form === "B1" ? parsed.dataB1 : parsed.dataA1

    if (!data || data.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Nothing to Import",
        text: `Form ${form} has no records to import.`
      })
      return { success: false }
    }

    Swal.fire({
      title: "Importing…",
      html: `Uploading <strong>${data.length}</strong> record(s) from Form ${form}.<br/>Please wait.`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    })

    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/import`,
        {
          meta: parsed.meta,
          form,
          data
        }
      )

      Swal.close()

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Import Successful",
          html: `
            <p>${response.data.message}</p>
            <p class="text-sm text-gray-500 mt-1">
              File: <strong>${parsed.fileName}</strong>
            </p>
          `,
          confirmButtonColor: "#15803d"
        })

        await get().fetchCrops()

        return response.data
      }

    } catch (error) {
      Swal.close()

      const serverMessage = error.response?.data?.message

      await Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: serverMessage || "An unexpected error occurred. Please try again.",
        confirmButtonColor: "#dc2626"
      })

      return {
        success: false,
        message: serverMessage || "Import failed"
      }
    }
  },

  clearError: () => set({ error: null }),

  deleteCommodity: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/crops/commodities/${id}`)
      await get().fetchCrops()
      return response.data
    } catch (err) {
      console.error("deleteCommodity error:", err)
      return { success: false, message: err.response?.data?.message || "Failed to delete commodity" }
    }
  },

  updateCommodity: async (id, formData) => {
    if (!formData.category_id || !formData.name) {
      return { success: false, message: "Category and name are required" }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/api/crops/commodities/${id}`,
        formData
      )

      await get().fetchCrops()

      return response.data
    } catch (err) {
      console.error("updateCommodity error:", err)
      return { success: false, message: err.response?.data?.message || "Failed to update commodity" }
    }
  }
}))
