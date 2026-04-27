import React, { useState, useEffect, useMemo } from "react"
import { useCropstore } from "../../store/CropsStore.js"
import AddPriceRecordModal from "../price_monitoring/components/AddPriceRecordModal.jsx"
import AddCommodityModal from "../price_monitoring/components/AddCommodityModal"
import CommodityTable from "../price_monitoring/components/CommoditiesTable.jsx"
import ImportExcelModal from "../price_monitoring/components/ImportExcelModal.jsx"
import ImportPDFModal from "../price_monitoring/components/ImportPDFModal.jsx"
import Header from "../public/components/Header.jsx"
import Sidebar from "../public/components/SideBar.jsx"
import { TrendingUp, AlertCircle, Calendar, BarChart3, Search, X } from 'lucide-react'

const AdminPriceMonitoring = () => {
  // Store selectors
  const crops = useCropstore((state) => state.crops)
  const isLoading = useCropstore((state) => state.isLoading)
  const error = useCropstore((state) => state.error)
  const markets = useCropstore((state) => state.markets)
  const categories = useCropstore((state) => state.categories)

  const fetchCrops = useCropstore((state) => state.fetchCrops)
  const fetchMarkets = useCropstore((state) => state.fetchMarkets)
  const fetchCategories = useCropstore((state) => state.fetchCategories)

  // Modal states
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false)
  const [isAddCommodityOpen, setIsAddCommodityOpen] = useState(false)
  const [isExcelUploadOpen, setExcelUploadOpen] = useState(false)
  const [isPDFuploadOpen, setPDFUploadOpen] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedMarket, setSelectedMarket] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Initialize on mount
  const initialized = React.useRef(false)
  useEffect(() => {
    if (!initialized.current) {
      fetchCrops()
      fetchMarkets()
      fetchCategories()
      initialized.current = true
    }
  }, [fetchCrops, fetchMarkets, fetchCategories])

  // Filter crops
  const filteredCrops = useMemo(() => {
    const search = searchTerm.toLowerCase()
    return crops.filter((crop) => {
      const matchesSearch =
        !search ||
        crop.name.toLowerCase().includes(search) ||
        (crop.specification || "").toLowerCase().includes(search)
      const matchesCategory =
        !selectedCategory || crop.categories === selectedCategory
      const matchesMarket =
        !selectedMarket ||
        (crop.markets && selectedMarket in crop.markets)
      return matchesSearch && matchesCategory && matchesMarket
    })
  }, [crops, searchTerm, selectedCategory, selectedMarket])

  // Analytics
  const analytics = useMemo(() => {
    if (filteredCrops.length === 0) {
      return { totalCommodities: 0, avgPrice: 0, priceRange: "—" }
    }

    const prices = filteredCrops
      .filter((crop) => crop.price)
      .map((crop) => parseFloat(crop.price))

    if (prices.length === 0) {
      return { totalCommodities: filteredCrops.length, avgPrice: 0, priceRange: "—" }
    }

    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
    const highestPrice = Math.max(...prices)
    const lowestPrice = Math.min(...prices)

    return {
      totalCommodities: filteredCrops.length,
      avgPrice: `₱${avgPrice}`,
      priceRange: `₱${lowestPrice.toFixed(2)} - ₱${highestPrice.toFixed(2)}`
    }
  }, [filteredCrops])

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedMarket("")
  }

  const hasActiveFilters = searchTerm || selectedCategory || selectedMarket

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e8f4f0 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

        .admin-price-monitoring {
          font-family: 'Outfit', sans-serif;
        }

        .admin-price-monitoring h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .admin-price-monitoring h2 {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
        }

        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(16, 185, 129, 0.2);
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: white;
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

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

        .action-button {
          position: relative;
          overflow: hidden;
        }

        .action-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transition: left 0.5s ease;
        }

        .action-button:hover::before {
          left: 100%;
        }

        .glow-accent {
          position: relative;
        }

        .glow-accent::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent);
          border-radius: inherit;
          pointer-events: none;
        }
      `}</style>

      <Header />

      <div className="admin-price-monitoring flex" style={{ minHeight: "calc(100vh - 65px)" }}>
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto w-full">
            {/* Hero Section */}
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}></div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Market Intelligence</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                    Price Monitoring
                  </h1>
                  <p className="text-gray-600 mt-3 flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-600" />
                    Track commodities and monitor market prices in real-time
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur border border-red-200/50 rounded-xl flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                  </div>
                  <button className="text-red-400 hover:text-red-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="stat-card rounded-xl p-5 glow-accent">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Total Commodities</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalCommodities}</p>
                <p className="text-xs text-gray-400 mt-2">In current filters</p>
              </div>
              <div className="stat-card rounded-xl p-5 glow-accent">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Average Price</p>
                <p className="text-3xl font-bold text-emerald-600">{analytics.avgPrice}</p>
                <p className="text-xs text-gray-400 mt-2">Across selected items</p>
              </div>
              <div className="stat-card rounded-xl p-5 glow-accent">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Price Range</p>
                <p className="text-lg font-bold text-gray-900">{analytics.priceRange}</p>
                <p className="text-xs text-gray-400 mt-2">Min - Max in filters</p>
              </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Sidebar - Controls */}
              <div className="lg:col-span-1 space-y-5">
                {/* Search */}
                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-gray-200/50 shadow-sm">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                    Quick Search
                  </label>
                  <div className="relative group">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Commodity name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 input-elegant rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-gray-200/50 shadow-sm">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 input-elegant rounded-lg text-sm appearance-none cursor-pointer bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2310b981' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      paddingRight: "36px"
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Market Filter */}
                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-gray-200/50 shadow-sm">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                    Market
                  </label>
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="w-full px-4 py-3 input-elegant rounded-lg text-sm appearance-none cursor-pointer bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2310b981' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      paddingRight: "36px"
                    }}
                  >
                    <option value="">All Markets</option>
                    {markets.map((market) => (
                      <option key={market.id} value={market.name}>{market.name}</option>
                    ))}
                  </select>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="filter-badge px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
                          {searchTerm}
                          <button
                            onClick={() => setSearchTerm("")}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="filter-badge px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
                          {selectedCategory}
                          <button
                            onClick={() => setSelectedCategory("")}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {selectedMarket && (
                        <span className="filter-badge px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
                          {selectedMarket}
                          <button
                            onClick={() => setSelectedMarket("")}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="w-full text-xs font-semibold px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 space-y-3 border-t border-gray-200">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
                    Quick Actions
                  </p>

                  <button
                    onClick={() => setIsAddPriceOpen(true)}
                    className="w-full btn-primary action-button text-white font-semibold rounded-lg py-3 px-4 text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Price Record
                  </button>

                  <button
                    onClick={() => setIsAddCommodityOpen(true)}
                    className="w-full btn-secondary action-button text-gray-700 font-semibold rounded-lg py-3 px-4 text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Commodity
                  </button>

                  <button
                    onClick={() => setExcelUploadOpen(true)}
                    className="w-full btn-secondary action-button text-gray-700 font-semibold rounded-lg py-3 px-4 text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Import Excel
                  </button>

                  <button
                    onClick={() => setPDFUploadOpen(true)}
                    className="w-full btn-secondary action-button text-gray-700 font-semibold rounded-lg py-3 px-4 text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Import PDF
                  </button>
                </div>
              </div>

              {/* Right Content - Table */}
              <div className="lg:col-span-4">
                <CommodityTable
                  filteredData={filteredCrops}
                  allCrops={crops}
                  isLoading={isLoading}
                  search={searchTerm}
                  categoryFilter={selectedCategory}
                  marketFilter={selectedMarket}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddPriceRecordModal
        isOpen={isAddPriceOpen}
        OnClose={() => setIsAddPriceOpen(false)}
      />
      <AddCommodityModal
        isOpen={isAddCommodityOpen}
        OnClose={() => setIsAddCommodityOpen(false)}
      />
      <ImportExcelModal
        isOpen={isExcelUploadOpen}
        OnClose={() => setExcelUploadOpen(false)}
      />
      <ImportPDFModal
        isOpen={isPDFuploadOpen}
        OnClose={() => setPDFUploadOpen(false)}
      />
    </div>
  )
}

export default AdminPriceMonitoring