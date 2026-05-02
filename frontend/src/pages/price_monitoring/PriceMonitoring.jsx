import React, { useState, useEffect, useMemo } from "react"
import MainCommodityTable from '../price_monitoring/components/MainCommoditiesTable.jsx'
import Header from "../public/components/Header.jsx"
import Sidebar from "../public/components/SideBar.jsx"
import { useCropstore } from "../../store/CropsStore.js"
import { Search, X } from 'lucide-react'

const PriceMonitoring = () => {
  // Store selectors
  const crops = useCropstore((state) => state.crops)
  const categories = useCropstore((state) => state.categories)
  const fetchCrops = useCropstore((state) => state.fetchCrops)
  const fetchCategories = useCropstore((state) => state.fetchCategories)

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [analyticsCategory, setAnalyticsCategory] = useState("all")

  // Initialize data on mount
  const initialized = React.useRef(false)
  useEffect(() => {
    if (!initialized.current) {
      fetchCrops()
      fetchCategories()
      initialized.current = true
    }
  }, [fetchCrops, fetchCategories])

  // Calculate filtered crops
  const filteredCrops = useMemo(() => {
    const search = searchTerm.toLowerCase()
    
    return crops.filter((crop) => {
      // Search filter: match name or specification
      const matchesSearch =
        !search ||
        crop.name.toLowerCase().includes(search) ||
        (crop.specification || "").toLowerCase().includes(search)

      // Category filter: exact match
      const matchesCategory =
        !categoryFilter || crop.categories === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [crops, searchTerm, categoryFilter])

  // Analytics for filtered data
  const stats = useMemo(() => {
    const cropsToAnalyze = analyticsCategory === "all"
      ? filteredCrops
      : filteredCrops.filter(c => c.categories === analyticsCategory)

    if (cropsToAnalyze.length === 0) {
      return { count: 0, avgPrice: "—", range: "—" }
    }

    const prices = []
    cropsToAnalyze.forEach((crop) => {
      if (crop.markets) {
        Object.values(crop.markets).forEach((marketData) => {
          if (marketData.prevailing) {
            prices.push(parseFloat(marketData.prevailing))
          }
        })
      }
    })

    if (prices.length === 0) {
      return { count: cropsToAnalyze.length, avgPrice: "—", range: "—" }
    }

    const avg = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
    const high = Math.max(...prices).toFixed(2)
    const low = Math.min(...prices).toFixed(2)

    return {
      count: cropsToAnalyze.length,
      avgPrice: `₱${avg}`,
      range: `₱${low} - ₱${high}`
    }
  }, [filteredCrops, analyticsCategory])

  const hasFilters = searchTerm || categoryFilter

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("")
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');


        .input-elegant {
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid rgba(16, 185, 129, 0.15);
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .input-elegant:focus {
          background: white;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          outline: none;
        }

        .filter-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.3);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(16, 185, 129, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.1);
        }
      `}</style>

      <Header />

      <div className="price-monitoring flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                Price Monitoring
              </h1>
              <p className="text-gray-600">Search and filter commodities to track market prices</p>
            </div>

            {/* Search & Filter Section */}
            <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-200/50 p-6 mb-8">
              <div className="space-y-4">
                {/* Search Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Commodities
                  </label>
                  <div className="relative group">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Search by name or specification..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 input-elegant rounded-lg text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="flex gap-2 items-end">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="flex-1 px-4 py-3 input-elegant rounded-lg text-sm appearance-none cursor-pointer bg-right"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2310b981' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        paddingRight: "36px"
                      }}
                    >
                      <option value="">All Categories</option>
                      <option value="LOWLAND VEGETABLES">Lowland Vegetables</option>
                      <option value="HIGHLAND VEGETABLES">Highland Vegetables</option>
                      <option value="FRUITS">Fruits</option>
                      <option value="FISH">Fish</option>
                      <option value="LIVESTOCK & POULTRY PRODUCTS">Livestock & Poultry</option>
                      <option value="SPICES">Spices</option>
                      <option value="ROOTCROPS">Rootcrops</option>
                      <option value="CORN">Corn</option>
                      <option value="LOCAL COMMERCIAL RICE">Local Commercial Rice</option>
                      <option value="IMPORTED COMMERCIAL RICE">Imported Commercial Rice</option>
                      <option value="OTHER BASIC COMMODITIES">Other Basic Commodities</option>
                    </select>
                    
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasFilters && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="filter-badge px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
                          Search: {searchTerm}
                          <button
                            onClick={() => setSearchTerm("")}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {categoryFilter && (
                        <span className="filter-badge px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
                          {categoryFilter}
                          <button
                            onClick={() => setCategoryFilter("")}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="stat-card rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Commodities Found</p>
                <p className="text-3xl font-bold text-gray-900">{stats.count}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {analyticsCategory === "all" ? "Across all categories" : `In ${analyticsCategory}`}
                </p>
              </div>
              <div className="stat-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Average Price</p>
                  <select
                    value={analyticsCategory}
                    onChange={(e) => setAnalyticsCategory(e.target.value)}
                    className="text-xs px-2 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium cursor-pointer hover:bg-emerald-100 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <p className="text-3xl font-bold text-emerald-600">{stats.avgPrice}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {analyticsCategory === "all" ? "Overall average" : `In ${analyticsCategory}`}
                </p>
              </div>
              <div className="stat-card rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Price Range</p>
                <p className="text-lg font-bold text-gray-900">{stats.range}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {analyticsCategory === "all" ? "Across all categories" : `In ${analyticsCategory}`}
                </p>
              </div>
            </div>

            {/* Table */}
            <MainCommodityTable
              filteredData={filteredCrops}
              allCrops={crops}
              search={searchTerm}
              categoryFilter={categoryFilter}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default PriceMonitoring