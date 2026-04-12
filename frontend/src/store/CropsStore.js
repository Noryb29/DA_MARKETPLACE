import { create } from "zustand"
import axios from "axios"
import Swal from "sweetalert2"

const BASE_URL = "http://localhost:5000"

export const useCropstore = create((set, get) => ({
  crops: [],
  markets: [],
  categories: [],
  commodities: [],
  commodityPrices: [],
  isLoading: false,
  error: null,

  // =====================
  // FETCH CROPS WITH PROPER GROUPING
  // =====================
  fetchCrops: async () => {
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
        // Initialize commodity if not exists
        if (!grouped[item.commodity_id]) {
          grouped[item.commodity_id] = {
            id: item.commodity_id,
            name: item.name,
            specification: item.specification || "",
            categories: item.category, // Category name
            price_date: item.price_date,
            price_count: item.price_count,
            respondent_count: item.respondent_count,
            markets: {}
          }
        }

        // Add market data if it exists
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

  // =====================
  // FETCH MARKETS
  // =====================
  fetchMarkets: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/crops/markets`)
      set({ markets: response.data.data || [] })
    } catch (error) {
      console.error("Failed to fetch markets:", error)
      set({ error: "Failed to fetch markets" })
    }
  },

  // =====================
  // FETCH CATEGORIES
  // =====================
  fetchCategories: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/crops/categories`)
      set({ categories: response.data.data || [] })
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      set({ error: "Failed to fetch categories" })
    }
  },

  // =====================
  // FETCH COMMODITIES
  // =====================
  fetchCommodities: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/crops/commodities`)
      set({ commodities: response.data.data || [] })
    } catch (error) {
      console.error("Failed to fetch commodities:", error)
      set({ error: "Failed to fetch commodities" })
    }
  },

  // =====================
  // FETCH COMMODITY PRICE HISTORY
  // =====================
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

  // =====================
  // ADD COMMODITY
  // =====================
  addCommodity: async (formData) => {
    if (!formData.category_id || !formData.name) {
      return { success: false, message: "Category and name are required" }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/commodities`,
        formData
      )

      // Refresh crops list after adding
      await get().fetchCrops()

      return response.data
    } catch (err) {
      console.error("addCommodity error:", err)
      return { success: false, message: err.response?.data?.message || "Failed to add commodity" }
    }
  },

  // =====================
  // ADD PRICE RECORD
  // =====================
  addPriceRecord: async (formData) => {
    if (!formData.commodity_id || !formData.market_id || !formData.price_date) {
      return { success: false, message: "Missing required fields" }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/prices`,
        formData
      )

      // Refresh crops list after adding price
      await get().fetchCrops()

      return response.data
    } catch (err) {
      // 409 = duplicate record
      if (err.response?.status === 409) {
        return err.response.data
      }
      return { success: false, message: err.response?.data?.message || "Failed to add price record" }
    }
  },

  // =====================
  // ADD CATEGORY
  // =====================
  addCategory: async (name) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/categories`,
        { name }
      )

      // Refresh categories list
      await get().fetchCategories()

      return response.data
    } catch (err) {
      console.error("addCategory error:", err)
      return { success: false, message: err.response?.data?.message || "Failed to add category" }
    }
  },

  // =====================
  // ADD MARKET
  // =====================
  addMarket: async (name, city = "") => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/crops/markets`,
        { name, city }
      )

      // Refresh markets list
      await get().fetchMarkets()

      return response.data
    } catch (err) {
      console.error("addMarket error:", err)
      return { success: false, message: err.response?.data?.message || "Failed to add market" }
    }
  },

  // =====================
  // UPDATE COMMODITY
  // =====================
  updateCommodity: async (id, formData) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/crops/commodities/${id}`,
        formData
      )
      return response.data
    } catch (err) {
      console.error("updateCommodity error:", err)
      throw err
    }
  },

  // =====================
  // DELETE COMMODITY
  // =====================
  deleteCommodity: async (id) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/crops/commodities/${id}`
      )
      return response.data
    } catch (err) {
      console.error("deleteCommodity error:", err)
      throw err
    }
  },

  // =====================
  // IMPORT EXCEL FORM RECORDS
  // =====================
  /**
   * Sends the fully-parsed workbook data (from parsers.js) to the
   * Express bulk-import endpoint.
   *
   * @param {object} parsed   - Output of readWorkbook():
   *                            { meta, dataA1, dataB1, hasA1, hasB1, fileName }
   * @param {"A1"|"B1"} form  - Which form sheet to import
   *
   * Shows a progress indicator while uploading, then a success/error alert.
   * Re-fetches crops after a successful import so the UI reflects
   * the new data immediately.
   */
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

    // Show a non-dismissable loading dialog while the request is in flight
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

        // Refresh the main crops list so the table reflects new rows
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
  }
}))