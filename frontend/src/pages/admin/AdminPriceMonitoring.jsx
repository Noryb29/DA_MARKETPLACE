import React, { useState, useEffect, useMemo } from "react"
import { useCropstore } from "../../store/CropsStore.js"
import AddPriceRecordModal from "../price_monitoring/components/AddPriceRecordModal.jsx"
import AddCommodityModal from "../price_monitoring/components/AddCommodityModal"
import CommodityTable from "../price_monitoring/components/CommoditiesTable.jsx"
import ImportExcelModal from "../price_monitoring/components/ImportExcelModal.jsx"
import ImportPDFModal from "../price_monitoring/components/ImportPDFModal.jsx"
import Header from "../public/components/Header.jsx"
import Sidebar from "../public/components/SideBar.jsx"

const AdminPriceMonitoring = () => {
  // 1. USE SELECTORS: This prevents re-renders when unrelated store state changes
  const crops = useCropstore((state) => state.crops)
  const isLoading = useCropstore((state) => state.isLoading)
  const error = useCropstore((state) => state.error)
  
  // Select actions separately
  const fetchCrops = useCropstore((state) => state.fetchCrops)
  const fetchMarkets = useCropstore((state) => state.fetchMarkets)
  const fetchCategories = useCropstore((state) => state.fetchCategories)
  const availableCategories = useCropstore((state) => state.categories)
  const availableMarkets = useCropstore((state) => state.markets)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAddCommodityOpen, setIsAddCommodityOpen] = useState(false)
  const [isExcelUploadOpen, setExcelUploadOpen] = useState(false)
  const [isPDFuploadOpen, setPDFUploadOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedMarket, setSelectedMarket] = useState("")

  // 2. STRICT MOUNT EFFECT: 
  // We use a ref to ensure this ONLY ever runs once, even if React Strict Mode 
  // tries to double-mount or the store functions change.
  const initialized = React.useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      console.log("Fetching monitoring data...") // Check your console!
      fetchCrops()
      fetchMarkets()
      fetchCategories()
      initialized.current = true
    }
  }, [fetchCrops, fetchMarkets, fetchCategories])
  // 4. Corrected Filter Logic
  const filteredCrops = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    
    return crops.filter((crop) => {
      // Wrap OR conditions in parentheses to isolate search logic
      const matchesSearch = !searchTerm || (
        crop.name.toLowerCase().includes(lowerSearch) ||
        (crop.specification || "").toLowerCase().includes(lowerSearch)
      );

      const matchesCategory = !selectedCategory || crop.categories === selectedCategory;

      const matchesMarket = !selectedMarket || 
        (crop.markets && Object.keys(crop.markets).includes(selectedMarket));

      return matchesSearch && matchesCategory && matchesMarket;
    });
  }, [crops, searchTerm, selectedCategory, selectedMarket]);

  const hasFilters = selectedCategory || selectedMarket || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedMarket("");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="flex" style={{ minHeight: "calc(100vh - 65px)" }}>
        <Sidebar onLogout={() => {}} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    🔍 Search Commodities
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by commodity name or specification..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔎
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category
                    </label>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Market
                    </label>

                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                  >
                    <option value="">All Markets</option>
                    {availableMarkets.map((market) => (
                      <option key={market.id} value={market.name}>
                        {market.name}
                      </option>
                    ))}
                  </select>

                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    {hasFilters ? (
                      <span>
                        Showing{" "}
                        <span className="font-semibold text-green-700">
                          {filteredCrops.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold">{crops.length}</span>{" "}
                        commodities
                      </span>
                    ) : (
                      <span>
                        Displaying{" "}
                        <span className="font-semibold text-green-700">
                          {crops.length}
                        </span>{" "}
                        total commodities
                      </span>
                    )}
                  </div>

                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-sm transition-colors duration-200 border border-red-200"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setIsAddOpen(true)}
              className="group relative overflow-hidden rounded-2xl border-2 border-green-600 bg-gradient-to-br from-green-600 to-green-700 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 active:scale-95"
            >
              <div className="relative">
                <div className="mb-2 text-3xl">📝</div>
                <p className="font-bold text-white text-sm">
                  Add Price Record
                </p>
                <p className="text-xs text-green-100 mt-1">
                  Log a new price entry
                </p>
              </div>
            </button>

            <button
              onClick={() => setIsAddCommodityOpen(true)}
              className="group relative overflow-hidden rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              <div className="relative">
                <div className="mb-2 text-3xl">🌿</div>
                <p className="font-bold text-white text-sm">Add Commodity</p>
                <p className="text-xs text-blue-100 mt-1">
                  Register a new commodity
                </p>
              </div>
            </button>

            <button
              onClick={() => setExcelUploadOpen(true)}
              className="group relative overflow-hidden rounded-2xl border-2 border-amber-600 bg-gradient-to-br from-amber-600 to-amber-700 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
            >
              <div className="relative">
                <div className="mb-2 text-3xl">📊</div>
                <p className="font-bold text-white text-sm">Import Excel</p>
                <p className="text-xs text-amber-100 mt-1">
                  Upload commodity prices
                </p>
              </div>
            </button>

            <button
              onClick={() => setPDFUploadOpen(true)}
              className="group relative overflow-hidden rounded-2xl border-2 border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
            >
              <div className="relative">
                <div className="mb-2 text-3xl">📄</div>
                <p className="font-bold text-white text-sm">Import PDF</p>
                <p className="text-xs text-purple-100 mt-1">
                  Extract prices from PDF
                </p>
              </div>
            </button>
          </div>

          {error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-red-700">
              <p className="font-semibold">Error loading data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-slate-600 font-medium">
                Loading commodities...
              </p>
            </div>
          ) : (
            <CommodityTable
              data={filteredCrops}
              filteredCount={filteredCrops.length}
              totalCount={crops.length}
            />
          )}
        </main>
      </div>

      <AddPriceRecordModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <AddCommodityModal
        isOpen={isAddCommodityOpen}
        onClose={() => setIsAddCommodityOpen(false)}
      />

      <ImportExcelModal
        isOpen={isExcelUploadOpen}
        onClose={() => setExcelUploadOpen(false)}
      />

      <ImportPDFModal
        isOpen={isPDFuploadOpen}
        onClose={() => setPDFUploadOpen(false)}
      />
    </div>
  )
}

export default AdminPriceMonitoring