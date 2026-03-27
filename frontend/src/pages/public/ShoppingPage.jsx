import React, { useEffect, useState, useMemo } from 'react'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import useMarketStore from '../../store/MarketStore'
import {
  Wheat, Search, SlidersHorizontal, MapPin, Calendar, Archive,
  Package, X, ChevronDown, Loader2, Sprout
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : null

const getDaysUntilHarvest = (date) => {
  if (!date) return null
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

const HarvestBadge = ({ date }) => {
  const days = getDaysUntilHarvest(date)
  if (days === null) return null
  if (days < 0) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Harvested</span>
  )
  if (days <= 7) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">Harvest in {days}d</span>
  )
  if (days <= 30) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Harvest in {days}d</span>
  )
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">Harvest in {days}d</span>
  )
}

// ─── Crop Row ─────────────────────────────────────────────────────────────────
const CropRow = ({ crop }) => {
  const specs = [1, 2, 3, 4, 5]
    .map((n) => crop[`specification_${n}`])
    .filter(Boolean)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:border-green-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center gap-4">

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
          <Wheat className="w-5 h-5 text-green-600" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-sm">{crop.crop_name}</p>
            {crop.variety && (
              <span className="text-xs text-gray-400 font-medium">· {crop.variety}</span>
            )}
            <HarvestBadge date={crop.expected_harvest} />
          </div>

          {/* Farm */}
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 truncate">{crop.farm_name}</span>
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {specs.map((s, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col items-end gap-2 shrink-0">

          {/* Volume + Stock */}
          {(crop.volume || crop.stock) && (
            <div className="flex items-center gap-2">
              {crop.volume && (
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                  <Package className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-green-700">
                    {Number(crop.volume).toLocaleString()} <span className="font-normal">kg</span>
                  </span>
                </div>
              )}
              {crop.stock && (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                  <Archive className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700">
                    {Number(crop.stock).toLocaleString()} <span className="font-normal">pcs</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-3 text-right">
            {crop.planting_date && (
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Planted</p>
                <p className="text-xs font-semibold text-gray-600">{formatDate(crop.planting_date)}</p>
              </div>
            )}
            {crop.expected_harvest && (
              <>
                <div className="w-px h-8 bg-gray-100" />
                <div>
                  <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wide">Harvest</p>
                  <p className="text-xs font-semibold text-amber-700">{formatDate(crop.expected_harvest)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ShoppingPage = () => {
  const { crops, loading, initialized, getAllCrops } = useMarketStore()

  const [search, setSearch] = useState('')
  const [filterVariety, setFilterVariety] = useState('')
  const [filterHarvest, setFilterHarvest] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { getAllCrops() }, [])

  // Derived filter options
  const varieties = useMemo(() =>
    [...new Set(crops.map((c) => c.variety).filter(Boolean))].sort()
  , [crops])

  const cropNames = useMemo(() =>
    [...new Set(crops.map((c) => c.crop_name).filter(Boolean))].sort()
  , [crops])

  // Filtered list
  const filtered = useMemo(() => {
    return crops.filter((c) => {
      const matchSearch =
        !search ||
        c.crop_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.variety?.toLowerCase().includes(search.toLowerCase()) ||
        c.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
        [1,2,3,4,5].some(n => c[`specification_${n}`]?.toLowerCase().includes(search.toLowerCase()))

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
          <div className="max-w-3xl mx-auto">

            {/* Page Header */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Sprout className="w-3.5 h-3.5" />
                Public Marketplace
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Produce</h1>
              <p className="text-gray-500 mt-1 text-sm">Fresh crops listed directly by registered farmers.</p>
            </div>

            {/* Search + Filter Bar */}
            <div className="flex gap-2 mb-4">
              {/* Search */}
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

              {/* Filter toggle */}
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
              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">

                  {/* Variety filter */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Variety</label>
                    <div className="relative">
                      <select
                        value={filterVariety}
                        onChange={(e) => setFilterVariety(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border-2 border-gray-200
                          focus:border-green-500 outline-none text-sm text-gray-700 font-medium bg-white transition-all"
                      >
                        <option value="">All varieties</option>
                        {varieties.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Harvest window filter */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Harvest Window</label>
                    <div className="relative">
                      <select
                        value={filterHarvest}
                        onChange={(e) => setFilterHarvest(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border-2 border-gray-200
                          focus:border-green-500 outline-none text-sm text-gray-700 font-medium bg-white transition-all"
                      >
                        <option value="">Any time</option>
                        <option value="week">Within 7 days</option>
                        <option value="month">Within 30 days</option>
                        <option value="harvested">Already harvested</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Clear all filters
                  </button>
                )}
              </div>
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