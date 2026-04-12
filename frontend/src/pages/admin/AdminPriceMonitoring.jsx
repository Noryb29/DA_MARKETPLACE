import React, { useState, useEffect, useMemo } from "react"
import { useCropstore } from "../../store/CropsStore.js"

import AddPriceRecordModal from "../price_monitoring/components/AddPriceRecordModal.jsx"
import AddCommodityModal from "../price_monitoring/components/AddCommodityModal"
import CommodityTable from "../price_monitoring/components/CommoditiesTable.jsx"
import ImportExcelModal from "../price_monitoring/components/ImportExcelModal.jsx"
import ImportPDFModal from "../price_monitoring/components/ImportPDFModal.jsx"

import Header from "../public/components/Header.jsx"
import Sidebar from "../public/components/SideBar.jsx"
import { TrendingUp, AlertCircle, Calendar, BarChart3 } from 'lucide-react'

const AdminPriceMonitoring = () => {
  const crops = useCropstore((state) => state.crops)
  const markets = useCropstore((state) => state.markets)
  const categories = useCropstore((state) => state.categories)
  const isLoading = useCropstore((state) => state.isLoading)
  const error = useCropstore((state) => state.error)

  const fetchCrops = useCropstore((state) => state.fetchCrops)
  const fetchMarkets = useCropstore((state) => state.fetchMarkets)
  const fetchCategories = useCropstore((state) => state.fetchCategories)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedMarket, setSelectedMarket] = useState("")

  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false)
  const [isAddCommodityOpen, setIsAddCommodityOpen] = useState(false)
  const [isExcelOpen, setExcelOpen] = useState(false)
  const [isPDFOpen, setPDFOpen] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([fetchCrops(), fetchMarkets(), fetchCategories()])
        setAnimateCards(true)
      } catch (err) {
        console.error("Failed to initialize data:", err)
      }
    }
    initData()
  }, [fetchCrops, fetchMarkets, fetchCategories])

  // Filter crops based on search, category, and market
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

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedMarket("")
  }

  const hasFilters = searchTerm || selectedCategory || selectedMarket
  const resultsCount = filteredCrops.length

  // Calculate analytics
  const priceStats = useMemo(() => {
    if (filteredCrops.length === 0) {
      return { avgPrice: 0, highestPrice: 0, lowestPrice: 0, priceChange: 0 }
    }

    const prices = filteredCrops
      .filter((crop) => crop.price)
      .map((crop) => parseFloat(crop.price))

    if (prices.length === 0) {
      return { avgPrice: 0, highestPrice: 0, lowestPrice: 0, priceChange: 0 }
    }

    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
    const highestPrice = Math.max(...prices).toFixed(2)
    const lowestPrice = Math.min(...prices).toFixed(2)

    return {
      avgPrice,
      highestPrice,
      lowestPrice,
      priceChange: parseFloat(avgPrice) > 0 ? 5.2 : -2.1, // Placeholder
    }
  }, [filteredCrops])

  const topMarkets = useMemo(() => {
    const marketCount = {}
    filteredCrops.forEach((crop) => {
      if (crop.markets) {
        Object.keys(crop.markets).forEach((market) => {
          marketCount[market] = (marketCount[market] || 0) + 1
        })
      }
    })
    return Object.entries(marketCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
  }, [filteredCrops])

  const categoryDistribution = useMemo(() => {
    const catCount = {}
    filteredCrops.forEach((crop) => {
      if (crop.categories) {
        catCount[crop.categories] = (catCount[crop.categories] || 0) + 1
      }
    })
    return Object.entries(catCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
  }, [filteredCrops])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex" style={{ minHeight: "calc(100vh - 65px)" }}>
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Price Monitoring
                  </h1>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                    <Calendar size={16} />
                    Manage commodities and track market prices across regions
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={20} />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
                <button className="text-red-500 hover:text-red-700 font-semibold">
                  ✕
                </button>
              </div>
            )}

            {/* Search & Filter Panel - Top */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Search Commodities
                </label>
                <div className="relative group">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, specification..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium appearance-none cursor-pointer transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Market
                  </label>
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium appearance-none cursor-pointer transition-all"
                  >
                    <option value="">All Markets</option>
                    {markets.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full text-sm font-semibold px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      ✕ Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Grid - Controls on left, Full-width table on right */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ minHeight: "calc(100vh - 360px)" }}>
              {/* Left Sidebar - Controls & Analytics */}
              <div className="space-y-4 " style={{ maxHeight: "calc(100vh - 360px)" }}>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-widest font-semibold text-gray-500 mb-3">
                    Quick Actions
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsAddPriceOpen(true)}
                      className="w-full h-12 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Price
                    </button>

                    <button
                      onClick={() => setIsAddCommodityOpen(true)}
                      className="w-full h-15 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Commodity
                    </button>

                    <button
                      onClick={() => setExcelOpen(true)}
                      className="w-full h-15 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Import Excel
                    </button>

                    <button
                      onClick={() => setPDFOpen(true)}
                      className="w-full h-15 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Import PDF
                    </button>
                  </div>
                </div>

                {/* Price Statistics Card */}
                <div
                  className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 ${
                    animateCards ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    transitionDelay: animateCards ? "100ms" : "0ms",
                  }}
                >
                  <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <BarChart3 size={14} className="text-blue-600" />
                    Price Stats
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Average Price</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-gray-900">₱{priceStats.avgPrice}</p>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          +{priceStats.priceChange}%
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <span className="text-gray-600">Highest</span>
                        <span className="font-bold text-gray-900">₱{priceStats.highestPrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Lowest</span>
                        <span className="font-bold text-gray-900">₱{priceStats.lowestPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Markets Card */}
                <div
                  className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 ${
                    animateCards ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    transitionDelay: animateCards ? "150ms" : "0ms",
                  }}
                >
                  <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Top Markets</h3>
                  <div className="space-y-2">
                    {topMarkets.length > 0 ? (
                      topMarkets.map(([market, count], idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">{market}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{
                                  width: `${(count / Math.max(...topMarkets.map(([, c]) => c))) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="font-medium text-gray-900 w-4 text-right">{count}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-2">No data</p>
                    )}
                  </div>
                </div>

                {/* Category Distribution Card */}
                <div
                  className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 ${
                    animateCards ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    transitionDelay: animateCards ? "200ms" : "0ms",
                  }}
                >
                  <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Categories</h3>
                  <div className="space-y-2">
                    {categoryDistribution.length > 0 ? (
                      categoryDistribution.map(([category, count], idx) => (
                        <div key={idx} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs">
                          <span className="font-medium text-gray-700 truncate">{category}</span>
                          <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded ml-2">
                            {count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-2">No data</p>
                    )}
                  </div>
                </div>

                {/* Summary Stats */}
                <div
                  className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 ${
                    animateCards ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    transitionDelay: animateCards ? "250ms" : "0ms",
                  }}
                >
                  <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Total Commodities</span>
                      <span className="font-bold text-gray-900">{crops.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Filtered Results</span>
                      <span className="font-bold text-gray-900">{resultsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Total Markets</span>
                      <span className="font-bold text-gray-900">{markets.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Categories</span>
                      <span className="font-bold text-gray-900">{categories.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Full Width Table */}
              <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col" style={{ minHeight: "calc(100vh - 360px)" }}>
                {/* Table Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Commodities</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{resultsCount} results</p>
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin mb-4">
                          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-500">Loading commodities...</p>
                      </div>
                    </div>
                  ) : resultsCount === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No commodities found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your filters or add a new commodity</p>
                      </div>
                    </div>
                  ) : (
                    <CommodityTable
                      crops={filteredCrops}
                      categories={categories}
                      markets={markets}
                      totalCount={crops.length}
                    />
                  )}
                </div>
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
        isOpen={isExcelOpen}
        OnClose={() => setExcelOpen(false)}
      />

      <ImportPDFModal
        isOpen={isPDFOpen}
        OnClose={() => setPDFOpen(false)}
      />
    </div>
  )
}

export default AdminPriceMonitoring