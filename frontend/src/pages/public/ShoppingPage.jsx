import React, { useEffect, useState, useMemo } from 'react'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import useMarketStore from '../../store/MarketStore'
import CropRow from './shopComponents/CropRow'
import MarketFilterPanel from './shopComponents/MarketFilterPanel'
import CartDrawer from './shopComponents/CartDrawer'
import useCartStore from '../../store/CartStore'
import useUserStore from '../../store/UserStore'
import { getDaysUntilHarvest } from './shopComponents/HarvestBadge'
import { Wheat, Search, SlidersHorizontal, X, Loader2, Sprout,ShoppingCart } from 'lucide-react'

const ShoppingPage = () => {
  const { items, openCart } = useCartStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const { crops, initialized, getAllCrops } = useMarketStore()

  const [search, setSearch] = useState('')
  const [filterVariety, setFilterVariety] = useState('')
  const [filterHarvest, setFilterHarvest] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { getAllCrops() }, [])

  const varieties = useMemo(() =>
    [...new Set(crops.map((c) => c.variety).filter(Boolean))].sort()
  , [crops])

  const filtered = useMemo(() => {
    return crops.filter((c) => {
      const matchSearch =
        !search ||
        c.crop_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.variety?.toLowerCase().includes(search.toLowerCase()) ||
        c.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
        [1, 2, 3, 4, 5].some(n => c[`specification_${n}`]?.toLowerCase().includes(search.toLowerCase()))

      const matchVariety = !filterVariety || c.variety === filterVariety

      const matchHarvest = (() => {
        if (!filterHarvest) return true
        const days = getDaysUntilHarvest(c.expected_harvest)
        if (days === null) return false
        if (filterHarvest === 'week') return days >= 0 && days <= 7
        if (filterHarvest === 'month') return days >= 0 && days <= 30
        if (filterHarvest === 'harvested') return days < 0
        return true
      })()

      return matchSearch && matchVariety && matchHarvest
    })
  }, [crops, search, filterVariety, filterHarvest])

  const activeFilterCount = [filterVariety, filterHarvest].filter(Boolean).length

  const clearFilters = () => {
    setFilterVariety('')
    setFilterHarvest('')
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          
          <div className="max-w-6xl mx-auto">

            {/* Page Header */}
              <div className="mb-7 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                    <Sprout className="w-3.5 h-3.5" />
                    Public Marketplace
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Produce</h1>
                  <p className="text-gray-500 mt-1 text-sm">Fresh crops listed directly by registered farmers.</p>
                </div>

                {/* Cart button */}
                <button
                  onClick={openCart}
                  className="relative flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200
                    hover:border-green-400 rounded-xl text-sm font-semibold text-gray-700
                    hover:text-green-700 transition-all mt-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold
                      w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            {/* Search + Filter Bar */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by crop, variety, farm…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white
                    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)]
                    outline-none text-sm text-gray-800 font-medium transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                  ${showFilters || activeFilterCount > 0
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <MarketFilterPanel
                varieties={varieties}
                filterVariety={filterVariety}
                setFilterVariety={setFilterVariety}
                filterHarvest={filterHarvest}
                setFilterHarvest={setFilterHarvest}
                activeFilterCount={activeFilterCount}
                clearFilters={clearFilters}
              />
            )}

            {/* Results count */}
            {initialized && (
              <p className="text-xs text-gray-400 font-medium mb-3">
                {filtered.length === crops.length
                  ? `${crops.length} listings`
                  : `${filtered.length} of ${crops.length} listings`}
              </p>
            )}

            {/* Loading */}
            {!initialized && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
              </div>
            )}

            {/* Empty state */}
            {initialized && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-5 rounded-full">
                  <Wheat className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">No crops found</p>
                <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
                {(search || activeFilterCount > 0) && (
                  <button onClick={clearFilters} className="mt-1 text-xs text-green-600 font-semibold hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
            
            <CartDrawer/>

            {/* Crop Rows */}
            {initialized && filtered.length > 0 && (
              <div className="space-y-3">
                {filtered.map((crop) => (
                  <CropRow key={crop.crop_id} crop={crop} />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default ShoppingPage
